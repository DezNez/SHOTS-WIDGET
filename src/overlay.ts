import { animate } from "motion";

const urlParams = new URLSearchParams(window.location.search);
const channel = urlParams.get('channel');
if (!channel) document.body.innerHTML = '<h1 class="text-red-500 text-2xl font-bold">❌ Укажите ?channel=...</h1>';

const wsUrl = `wss://newbot.mickeyisdev.ru/ws/shots/${channel}`;
let ws: WebSocket;

interface Shot { id: number; name: string; count: number; base_price: number; step: number; }

const app = document.getElementById('app')!;

interface RenderedCard {
    element: HTMLDivElement;
    priceEl: HTMLElement;
    nextPriceEl: HTMLElement;
    stepEl: HTMLElement; // <--- ДОБАВЛЕНО
    count: number;
    price: number;
    step: number;        // <--- ДОБАВЛЕНО
}

const renderedElements = new Map<number, RenderedCard>();

function animateValueChange(element: HTMLElement, newValue: string) {
    animate(element, { y: [0, 16], opacity: [1, 0] }, { duration: 0.15 }).finished.then(() => {
        element.textContent = newValue;
        animate(element, { y: [-16, 0], opacity: [0, 1] }, { type: "spring", bounce: 0.3, duration: 0.35 });
    });
}

function render(shots: Shot[]) {
    const currentShotIds = new Set(shots.map(s => s.id));

    // Удаление старых позиций
    renderedElements.forEach((card, id) => {
        if (!currentShotIds.has(id)) {
            animate(card.element, 
                { opacity: [1, 0], x: [0, 40], scale: [1, 0.95] }, 
                { duration: 0.3 }
            ).finished.then(() => {
                card.element.remove();
            });
            renderedElements.delete(id);
        }
    });

    shots.forEach(shot => {
        const price = shot.base_price + (shot.count * shot.step);
        const nextPrice = price + shot.step;
        const existing = renderedElements.get(shot.id);

        if (!existing) {
            const el = document.createElement('div');
            // Убрали фон, оставили только отступы и выравнивание
            el.className = 'flex flex-col items-start justify-center mb-4 transform origin-left';
            
            // Минималистичный дизайн с мощной тенью для читаемости на любом фоне
            el.innerHTML = `
                <div class="text-3xl font-bold tracking-tight-display text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-2">
                    <span>${shot.name} -</span>
                    <span class="price-number inline-block overflow-hidden h-8">${price}</span>
                    <span>руб</span>
                </div>
                <div class="text-2xl font-bold tracking-tight-display text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-0.5 flex items-center gap-1.5 pl-1">
                    след +<span class="step-number inline-block">${shot.step}</span>
                </div>
            `;

            app.appendChild(el);

            const cardData: RenderedCard = {
                element: el,
                priceEl: el.querySelector('.price-number')!,
                nextPriceEl: el.querySelector('.next-price-number')!,
                stepEl: el.querySelector('.step-number')!, // <--- ДОБАВЛЕНО
                count: shot.count,
                price: price,
                step: shot.step // <--- ДОБАВЛЕНО
            };

            renderedElements.set(shot.id, cardData);

            // Анимация появления
            animate(el, 
                { opacity: [0, 1], scale: [0.95, 1], x: [-40, 0] }, 
                { type: "spring", bounce: 0.25, duration: 0.6 }
            );

        } else {
            // ИЗМЕНЕНО: Достаем stepEl и prevStep
            const { element, priceEl, nextPriceEl, stepEl, count: prevCount, price: prevPrice, step: prevStep } = existing;

            // ИЗМЕНЕНО: Проверяем еще и изменение шага
            if (prevPrice !== price || prevCount !== shot.count || prevStep !== shot.step) {
                
                if (prevPrice !== price) animateValueChange(priceEl, price.toString());
                
                // nextPrice меняется, если изменилась цена ИЛИ шаг
                animateValueChange(nextPriceEl, nextPrice.toString());
                
                if (prevStep !== shot.step) {
                    animateValueChange(stepEl, shot.step.toString());
                    existing.step = shot.step;
                }
                
                existing.price = price;
                existing.count = shot.count;

                // Легкий "пульс" всей надписи при обновлении
                animate(element, 
                    { scale: [1, 1.05, 1] }, 
                    { type: "spring", bounce: 0.4, duration: 0.35 }
                );
            }
        }
    });
}

function connect() {
    ws = new WebSocket(wsUrl);
    ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.action === 'update') render(msg.data);
    };
    ws.onclose = () => setTimeout(connect, 2000);
}

if (channel) connect();