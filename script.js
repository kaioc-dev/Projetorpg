// CONFIGURAÇÃO DOS CHEFÕES (1 por 10 níveis)
window.bossesDB = {
    10: { name: "Rei Goblin", baseHp: 200, baseAtk: 25, icon: "👑", lore: "Você derrotou o Rei Goblin e achou o diário dele. A Princesa Seraphina foi levada para a Floresta de Sangue!" },
    20: { name: "Fera das Sombras", baseHp: 400, baseAtk: 45, icon: "🐺", lore: "A Fera guardava a entrada das cavernas. Você achou um pedaço do vestido da princesa no chão." },
    30: { name: "General Orc", baseHp: 800, baseAtk: 70, icon: "👹", lore: "O General Orc confessou: o Deus da Ruína está usando a alma da princesa para abrir um portal!" },
    40: { name: "Bruxa do Pântano", baseHp: 1200, baseAtk: 100, icon: "🧙‍♀️", lore: "A bruxa caiu. Ela riu e disse que você jamais chegaria ao Palácio flutuante." },
    50: { name: "Dragão Negro", baseHp: 2500, baseAtk: 150, icon: "🐉", lore: "O Dragão protegia o desfiladeiro. Agora o caminho para o reino das sombras está aberto." },
    // ... adicione os outros até o 150
    150: { name: "Deus da Ruína", baseHp: 40000, baseAtk: 2000, icon: "🌌", lore: "O mal supremo caiu! A Princesa Seraphina corre para seus braços. Aethelgard está salva!" }
};

// EVENTOS DE HISTÓRIA COM NPCs
window.events = [
    {
        title: "🍻 O Bêbado na Estrada",
        desc: "Um homem cambaleia com uma garrafa. 'Ei! Vi uma fada voando com uma pista da princesa! Me dá 10 moedas que eu falo onde!'",
        choices: [
            { text: "💰 Dar 10 Ouro", action: () => { window.player.gold -= 10; window.ui.log("Ele aponta para o Norte e te dá uma Poção!", "loot"); window.player.potions++; }},
            { text: "🗣️ Usar Carisma", action: () => { if(window.player.cha > 10) { window.ui.log("Ele chora e confessa que mentiu, mas te dá 20 ouro de vergonha.", "loot"); window.player.gold += 20; } }}
        ]
    },
    {
        title: "🧚‍♀️ A Fada Presa",
        desc: "Uma fada está presa em uma teia mágica. Ela brilha intensamente.",
        choices: [
            { text: "🗡️ Cortar a Teia (Força)", action: () => { if(window.player.str > 12) { window.ui.log("Ela te cura totalmente como gratidão!", "loot"); window.player.heal(1000); } }},
            { text: "🚶 Ignorar", action: () => { window.ui.log("Você seguiu viagem com pressa.", "sys"); }}
        ]
    }
];

window.player = {
    playerName: "Herói", lvl: 1, xp: 0, xpToNext: 50, gold: 0, potions: 3, hp: 100, maxHp: 100, mp: 50, maxMp: 50,
    str: 5, dex: 5, spd: 5, cha: 5, atk: 10, def: 5, inventory: [], equipped: {},
    gainXp(v) {
        this.xp += v;
        if(this.xp >= this.xpToNext && this.lvl < 150) {
            this.lvl++; this.xp = 0; this.xpToNext = Math.floor(this.xpToNext * 1.3);
            this.maxHp += 20; this.hp = this.maxHp; this.str++; this.dex++; this.spd++; this.cha++;
            this.atk += 5; this.def += 2; window.ui.log(`🎊 Nível UP! Você está no Nvl ${this.lvl}`, "skill");
        }
        window.ui.update();
    },
    heal(v) { this.hp = Math.min(this.hp + v, this.maxHp); window.ui.update(); },
    buyPotion() { if(this.gold >= 20) { this.gold -= 20; this.potions++; window.ui.log("+1 Poção!", "loot"); } window.ui.update(); },
    usePotion() { if(this.potions > 0) { this.potions--; this.heal(60); window.ui.log("Curou 60 HP!", "loot"); } window.ui.update(); }
};

window.game = {
    explore() {
        let bossLvl = (window.player.highestBossDefeated || 0) + 10;
        if(window.player.lvl >= bossLvl && window.bossesDB[bossLvl]) {
            window.combat.start(window.bossesDB[bossLvl], true, bossLvl);
            return;
        }
        let r = Math.random();
        if(r < 0.3) window.ui.triggerEvent();
        else if(r < 0.7) window.combat.start({name: "Orc", baseHp: 40 + (window.player.lvl * 5), baseAtk: 10 + (window.player.lvl * 2), icon: "👹", gold: 15, xp: 20});
        else { window.player.gold += 10; window.ui.log("Achou 10 moedas!", "loot"); }
        window.ui.update();
    },
    confirmName() {
        let n = document.getElementById('input-hero-name').value;
        if(!n) return; window.player.playerName = n;
        document.getElementById('name-selection-screen').classList.add('hidden');
        window.ui.triggerPureStory("O Resgate de Seraphina", `Aethelgard clama por você, ${n}! A Princesa foi levada pelo Deus da Ruína para o abismo. Prepare-se, serão 150 níveis de puro perigo!`, "Começar Jornada", () => {
            document.getElementById('main-game-screen').classList.remove('hidden');
            document.getElementById('top-menu').classList.remove('hidden');
        });
    },
    // ... (restante da lógica de save/load igual ao anterior)
};

// Funções de UI
window.ui = {
    update() {
        document.getElementById('hp').innerText = window.player.hp;
        document.getElementById('max-hp').innerText = window.player.maxHp;
        document.getElementById('hp-bar').style.width = (window.player.hp / window.player.maxHp * 100) + "%";
        document.getElementById('lvl').innerText = window.player.lvl;
        document.getElementById('gold').innerText = window.player.gold;
        document.getElementById('atk-val').innerText = window.player.atk;
        document.getElementById('def-val').innerText = window.player.def;
        document.getElementById('str-val').innerText = window.player.str;
        document.getElementById('spd-val').innerText = window.player.spd;
        document.getElementById('dex-val').innerText = window.player.dex;
        document.getElementById('cha-val').innerText = window.player.cha;
    },
    log(m, c) {
        let l = document.getElementById('game-log');
        let li = document.createElement('li'); li.innerText = "> " + m; li.className = c;
        l.appendChild(li); l.parentElement.scrollTop = l.parentElement.scrollHeight;
    },
    triggerPureStory(t, d, b, cb) {
        document.getElementById('event-title').innerText = t;
        document.getElementById('event-desc').innerText = d;
        let cont = document.getElementById('event-choices'); cont.innerHTML = "";
        let btn = document.createElement('button'); btn.className = "btn-medieval"; btn.innerText = b;
        btn.onclick = () => { document.getElementById('event-modal').classList.add('hidden'); if(cb) cb(); };
        cont.appendChild(btn); document.getElementById('event-modal').classList.remove('hidden');
    },
    triggerEvent() {
        let ev = window.events[Math.floor(Math.random()*window.events.length)];
        document.getElementById('event-title').innerText = ev.title;
        document.getElementById('event-desc').innerText = ev.desc;
        let cont = document.getElementById('event-choices'); cont.innerHTML = "";
        ev.choices.forEach(c => {
            let b = document.createElement('button'); b.className = "btn-medieval"; b.innerText = c.text;
            b.onclick = () => { document.getElementById('event-modal').classList.add('hidden'); c.action(); };
            cont.appendChild(b);
        });
        document.getElementById('event-modal').classList.remove('hidden');
    },
    toggleMode(b) {
        document.getElementById('exploration-actions').classList.toggle('hidden', b);
        document.getElementById('combat-actions').classList.toggle('hidden', !b);
        document.getElementById('battle-arena').classList.toggle('hidden', !b);
    }
};

// Lógica de Combate Simplificada para o exemplo
window.combat = {
    start(e, isBoss, lvl) {
        this.enemy = e; this.isBoss = isBoss; this.lvl = lvl;
        document.getElementById('enemy-name-display').innerText = e.name;
        document.getElementById('enemy-art-icon').innerText = e.icon;
        window.ui.toggleMode(true);
    },
    attack() {
        let dmg = window.player.atk; this.enemy.baseHp -= dmg;
        window.ui.log(`Você causou ${dmg} de dano!`, "dmg-dealt");
        if(this.enemy.baseHp <= 0) {
            window.ui.log("Inimigo derrotado!", "loot");
            window.player.gainXp(20 + (window.player.lvl * 5));
            window.player.gold += 15;
            if(this.isBoss) {
                window.player.highestBossDefeated = this.lvl;
                window.ui.triggerPureStory("Vitória Épica", window.bossesDB[this.lvl].lore, "Continuar");
            }
            window.ui.toggleMode(false);
        } else {
            let edmg = Math.max(1, this.enemy.baseAtk - window.player.def);
            window.player.hp -= edmg; window.ui.log(`Inimigo causou ${edmg} de dano!`, "dmg-taken");
            if(window.player.hp <= 0) alert("Você morreu! O save será reiniciado.");
        }
        window.ui.update();
    },
    flee() { window.ui.log("Você fugiu!", "sys"); window.ui.toggleMode(false); }
};

window.game.chooseClass = (c) => {
    window.player.classObj = window.classesData[c];
    document.getElementById('class-selection-screen').classList.add('hidden');
    document.getElementById('name-selection-screen').classList.remove('hidden');
};

window.onload = () => { window.ui.update(); };
