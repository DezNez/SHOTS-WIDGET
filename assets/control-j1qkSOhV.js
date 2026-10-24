import"./style-YmQOSb7E.js";var e=new URLSearchParams(window.location.search),t=e.get(`channel`),n=e.get(`key`);(!t||!n)&&(document.body.innerHTML=`<h1 class="text-red-300 text-center mt-10 text-xl font-bold">❌ Укажите ?channel=...&key=...</h1>`);var r=`wss://newbot.mickeyisdev.ru/ws/shots/${t}`,i,a=document.getElementById(`shots-list`),o=[];function s(e){if(o=e,a.innerHTML=``,e.length===0){a.innerHTML=`<p class="text-white/40 text-center py-4 text-sm font-medium">Список пуст</p>`;return}e.forEach(e=>{let t=e.base_price+e.count*e.step,n=document.createElement(`div`);n.className=`bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-3 transition-all hover:bg-white/10`,n.innerHTML=`
            <div class="flex items-center justify-between">
                <div class="flex flex-col">
                    <span class="text-base font-semibold tracking-tight-display text-white/90">${e.name}</span>
                    <span class="text-[11px] text-white/40 font-medium">База: ${e.base_price}₽ • Шаг: ${e.step}₽</span>
                </div>
                <div class="flex gap-1">
                    <button class="apple-btn w-7 h-7 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/20 text-white/70" onclick="openModal(${e.id})">
                        <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                    </button>
                    <button class="apple-btn w-7 h-7 flex items-center justify-center rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400" onclick="deleteShot(${e.id})">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </div>
            <div class="flex items-center justify-between bg-black/20 rounded-lg p-2 border border-white/5">
                <div class="flex flex-col pl-1">
                    <span class="text-[10px] text-white/40 uppercase tracking-wider">След. шот</span>
                    <span class="text-lg font-bold tracking-tight-display text-blue-400 leading-none">${t}₽</span>
                </div>
                <div class="flex items-center gap-2">
                    <button class="apple-btn w-8 h-8 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white" onclick="updateCount(${e.id}, ${e.count-1})">
                        <i data-lucide="minus" class="w-4 h-4"></i>
                    </button>
                    <span class="w-6 text-center font-bold text-lg tracking-tight-display">${e.count}</span>
                    <button class="apple-btn w-8 h-8 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white" onclick="updateCount(${e.id}, ${e.count+1})">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `,a.appendChild(n)}),window.lucide&&window.lucide.createIcons()}function c(){i=new WebSocket(r),i.onmessage=e=>{let t=JSON.parse(e.data);t.action===`update`&&s(t.data)},i.onclose=()=>setTimeout(c,2e3)}t&&n&&c();var l=document.getElementById(`modal-overlay`),u=document.getElementById(`modal-content`),d=document.getElementById(`shot-form`);window.openModal=e=>{if(l.classList.remove(`hidden`),l.offsetWidth,l.classList.remove(`opacity-0`),u.classList.remove(`scale-95`),e!==void 0){let t=o.find(t=>t.id===e);t&&(document.getElementById(`modal-title`).innerText=`Редактировать шот`,document.getElementById(`shot-id`).value=t.id.toString(),document.getElementById(`shot-count`).value=t.count.toString(),document.getElementById(`name`).value=t.name,document.getElementById(`base_price`).value=t.base_price.toString(),document.getElementById(`step`).value=t.step.toString())}else document.getElementById(`modal-title`).innerText=`Добавить шот`,d.reset(),document.getElementById(`shot-id`).value=``,document.getElementById(`shot-count`).value=`0`},window.closeModal=()=>{l.classList.add(`opacity-0`),u.classList.add(`scale-95`),setTimeout(()=>{l.classList.add(`hidden`)},200)},window.updateCount=async(e,r)=>{if(r<0)return;let i=o.find(t=>t.id===e);if(!i)return;let a=new FormData;a.append(`id`,e.toString()),a.append(`name`,i.name),a.append(`base_price`,i.base_price.toString()),a.append(`step`,i.step.toString()),a.append(`count`,r.toString()),a.append(`channel`,t),a.append(`key`,n),await fetch(`https://newbot.mickeyisdev.ru/shots/update`,{method:`POST`,body:a})},window.deleteShot=async e=>{let r=new FormData;r.append(`id`,e.toString()),r.append(`channel`,t),r.append(`key`,n),await fetch(`https://newbot.mickeyisdev.ru/shots/delete`,{method:`POST`,body:r})},d.addEventListener(`submit`,async e=>{e.preventDefault();let r=document.getElementById(`shot-id`).value,i=document.getElementById(`shot-count`).value,a=document.getElementById(`name`).value,o=document.getElementById(`base_price`).value,s=document.getElementById(`step`).value,c=new FormData;c.append(`name`,a),c.append(`base_price`,o),c.append(`step`,s),c.append(`channel`,t),c.append(`key`,n),r?(c.append(`id`,r),c.append(`count`,i),await fetch(`https://newbot.mickeyisdev.ru/shots/update`,{method:`POST`,body:c})):await fetch(`https://newbot.mickeyisdev.ru/shots/add`,{method:`POST`,body:c}),window.closeModal()});