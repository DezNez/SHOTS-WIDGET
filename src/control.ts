const urlParams = new URLSearchParams(window.location.search);
const channel = urlParams.get('channel');
const key = urlParams.get('key');

if (!channel || !key) document.body.innerHTML = '<h1 class="text-red-500 text-center mt-10 text-xl font-bold">❌ Укажите ?channel=...&key=...</h1>';

const wsUrl = `wss://bot.mickeyisdev.ru/ws/shots/${channel}`;
let ws: WebSocket;

interface Shot { id: number; name: string; count: number; base_price: number; step: number; }

const list = document.getElementById('shots-list')!;
let currentShots: Shot[] = [];

function render(shots: Shot[]) {
    currentShots = shots;
    list.innerHTML = '';
    
    if (shots.length === 0) {
        list.innerHTML = '<p class="text-white/40 text-center py-4 text-sm font-medium">Список пуст</p>';
        return;
    }

    shots.forEach(shot => {
        const price = shot.base_price + (shot.count * shot.step);
        const el = document.createElement('div');
        el.className = 'bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-3 transition-all hover:bg-white/10';
        el.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex flex-col">
                    <span class="text-base font-semibold tracking-tight-display text-white/90">${shot.name}</span>
                    <span class="text-[11px] text-white/40 font-medium">База: ${shot.base_price}₽ • Шаг: ${shot.step}₽</span>
                </div>
                <div class="flex gap-1">
                    <button class="apple-btn w-7 h-7 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/20 text-white/70" onclick="openModal(${shot.id})">
                        <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                    </button>
                    <button class="apple-btn w-7 h-7 flex items-center justify-center rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400" onclick="deleteShot(${shot.id})">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </div>
            <div class="flex items-center justify-between bg-black/20 rounded-lg p-2 border border-white/5">
                <div class="flex flex-col pl-1">
                    <span class="text-[10px] text-white/40 uppercase tracking-wider">След. шот</span>
                    <span class="text-lg font-bold tracking-tight-display text-blue-400 leading-none">${price}₽</span>
                </div>
                <div class="flex items-center gap-2">
                    <button class="apple-btn w-8 h-8 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white" onclick="updateCount(${shot.id}, ${shot.count - 1})">
                        <i data-lucide="minus" class="w-4 h-4"></i>
                    </button>
                    <span class="w-6 text-center font-bold text-lg tracking-tight-display">${shot.count}</span>
                    <button class="apple-btn w-8 h-8 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white" onclick="updateCount(${shot.id}, ${shot.count + 1})">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
        list.appendChild(el);
    });
    
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
}

function connect() {
    ws = new WebSocket(wsUrl);
    ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.action === 'update') render(msg.data);
    };
    ws.onclose = () => setTimeout(connect, 2000);
}
if (channel && key) connect();

// --- Логика Модалки ---
const modalOverlay = document.getElementById('modal-overlay')!;
const modalContent = document.getElementById('modal-content')!;
const form = document.getElementById('shot-form') as HTMLFormElement;

(window as any).openModal = (id?: number) => {
    modalOverlay.classList.remove('hidden');
    // Небольшой хак для запуска CSS-транзишенов
    void modalOverlay.offsetWidth;
    modalOverlay.classList.remove('opacity-0');
    modalContent.classList.remove('scale-95');

    if (id !== undefined) {
        const shot = currentShots.find(s => s.id === id);
        if (shot) {
            document.getElementById('modal-title')!.innerText = 'Редактировать шот';
            (document.getElementById('shot-id') as HTMLInputElement).value = shot.id.toString();
            (document.getElementById('shot-count') as HTMLInputElement).value = shot.count.toString();
            (document.getElementById('name') as HTMLInputElement).value = shot.name;
            (document.getElementById('base_price') as HTMLInputElement).value = shot.base_price.toString();
            (document.getElementById('step') as HTMLInputElement).value = shot.step.toString();
        }
    } else {
        document.getElementById('modal-title')!.innerText = 'Добавить шот';
        form.reset();
        (document.getElementById('shot-id') as HTMLInputElement).value = '';
        (document.getElementById('shot-count') as HTMLInputElement).value = '0';
    }
};

(window as any).closeModal = () => {
    modalOverlay.classList.add('opacity-0');
    modalContent.classList.add('scale-95');
    setTimeout(() => {
        modalOverlay.classList.add('hidden');
    }, 200); // Ждем окончания анимации
};

// --- API Вызовы ---
(window as any).updateCount = async (id: number, newCount: number) => {
    if (newCount < 0) return;
    const shot = currentShots.find(s => s.id === id);
    if (!shot) return;
    
    const fd = new FormData();
    fd.append('id', id.toString()); fd.append('name', shot.name);
    fd.append('base_price', shot.base_price.toString()); fd.append('step', shot.step.toString());
    fd.append('count', newCount.toString()); fd.append('channel', channel!); fd.append('key', key!);

    await fetch('https://bot.mickeyisdev.ru/shots/update', { method: 'POST', body: fd });
};

(window as any).deleteShot = async (id: number) => {
    if (!confirm('Удалить позицию?')) return;
    const fd = new FormData();
    fd.append('id', id.toString()); fd.append('channel', channel!); fd.append('key', key!);
    await fetch('https://bot.mickeyisdev.ru/shots/delete', { method: 'POST', body: fd });
};

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = (document.getElementById('shot-id') as HTMLInputElement).value;
    const count = (document.getElementById('shot-count') as HTMLInputElement).value;
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const base = (document.getElementById('base_price') as HTMLInputElement).value;
    const step = (document.getElementById('step') as HTMLInputElement).value;

    const fd = new FormData();
    fd.append('name', name); fd.append('base_price', base); fd.append('step', step);
    fd.append('channel', channel!); fd.append('key', key!);

    if (id) {
        fd.append('id', id);
        fd.append('count', count);
        await fetch('https://bot.mickeyisdev.ru/shots/update', { method: 'POST', body: fd });
    } else {
        await fetch('https://bot.mickeyisdev.ru/shots/add', { method: 'POST', body: fd });
    }
    
    (window as any).closeModal();
});