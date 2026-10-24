import { animate } from "motion";

const urlParams = new URLSearchParams(window.location.search);
const channel = urlParams.get('channel');
if (!channel) document.body.innerHTML = '<h1 class="text-red-500 text-2xl font-bold">❌ Укажите ?channel=...</h1>';

const wsUrl = `wss://bot.mickeyisdev.ru/ws/shots/${channel}`;
let ws: WebSocket;

interface Shot { id: number; name: string; count: number; base_price: number; step: number; }

const app = document.getElementById('app')!;

interface RenderedCard {
    element: HTMLDivElement;
    textGroupEl: HTMLElement;
    countWrapper: HTMLElement;
    countNumberEl: HTMLElement;
    priceEl: HTMLElement;
    count: number;
    price: number;
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

    renderedElements.forEach((card, id) => {
        if (!currentShotIds.has(id)) {
            animate(card.element, 
                { opacity: [1, 0], x: [0, 80], scale: [1, 0.95] }, 
                { duration: 0.3 }
            ).finished.then(() => {
                card.element.remove();
            });
            renderedElements.delete(id);
        }
    });

    shots.forEach(shot => {
        const price = shot.base_price + (shot.count * shot.step);
        const existing = renderedElements.get(shot.id);

        if (!existing) {
            const el = document.createElement('div');
            // ИЗМЕНЕНО: Компактная высота (68px), темно-серый фон, скругления как на скрине, шире для крупного текста
            el.className = 'bg-[#3b3b40]/95 backdrop-blur-md rounded-xl px-5 flex items-center justify-between w-[420px] h-[68px] transform origin-right shadow-lg border border-white/10';
            
            // ИЗМЕНЕНО: Увеличены шрифты (text-2xl, text-3xl, text-lg) и добавлен шаг (+X₽)
            el.innerHTML = `
                <div class="text-group flex flex-col justify-center">
                    <span class="shot-title text-2xl font-bold tracking-tight-display text-white/95 leading-none">
                        ${shot.name}
                    </span>
                    <div class="count-wrapper overflow-hidden h-6 mt-1" 
                         style="${shot.count === 0 ? 'opacity: 0; transform: translateY(6px);' : 'opacity: 1; transform: translateY(0px);'}">
                        <span class="text-lg text-white/70 font-medium inline-flex items-center gap-1">
                            Выпито: 
                            <span class="count-number text-white font-bold inline-block overflow-hidden">${shot.count}</span>
                            <span class="text-white/40 text-base ml-1">(+${shot.step}₽)</span>
                        </span>
                    </div>
                </div>
                <div class="text-3xl font-bold tracking-tight-display text-white overflow-hidden h-10 flex items-center">
                    <span class="price-number inline-block">${price}₽</span>
                </div>
            `;

            app.appendChild(el);

            const textGroupEl = el.querySelector('.text-group') as HTMLElement;
            if (shot.count === 0) {
                textGroupEl.style.transform = 'translateY(12px)';
            }

            const cardData: RenderedCard = {
                element: el,
                textGroupEl: textGroupEl,
                countWrapper: el.querySelector('.count-wrapper')!,
                countNumberEl: el.querySelector('.count-number')!,
                priceEl: el.querySelector('.price-number')!,
                count: shot.count,
                price: price
            };

            renderedElements.set(shot.id, cardData);

            animate(el, 
                { opacity: [0, 1], scale: [0.95, 1], x: [80, 0] }, 
                { type: "spring", bounce: 0.25, duration: 0.6 }
            );

        } else {
            const { element, textGroupEl, countWrapper, countNumberEl, priceEl, count: prevCount, price: prevPrice } = existing;

            if (prevCount === 0 && shot.count > 0) {
                countNumberEl.textContent = shot.count.toString();
                animate(textGroupEl, { y: [12, 0] }, { type: "spring", bounce: 0.2, duration: 0.4 });
                animate(countWrapper, { opacity: [0, 1], y: [6, 0] }, { duration: 0.3 });
                existing.count = shot.count;
            } 
            else if (prevCount > 0 && shot.count === 0) {
                animate(countWrapper, { opacity: [1, 0], y: [0, 6] }, { duration: 0.25 });
                animate(textGroupEl, { y: [0, 12] }, { type: "spring", bounce: 0.2, duration: 0.4 });
                existing.count = 0;
            }
            else if (prevCount !== shot.count) {
                animateValueChange(countNumberEl, shot.count.toString());
                existing.count = shot.count;

                animate(element, 
                    { scale: [1, 1.03, 1] }, 
                    { type: "spring", bounce: 0.4, duration: 0.35 }
                );
            }

            if (prevPrice !== price) {
                animateValueChange(priceEl, `${price}₽`);
                existing.price = price;
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