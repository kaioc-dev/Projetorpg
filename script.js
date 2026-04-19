// CONFIGURAÇÃO DOS CHEFÕES (1 por 10 níveis)
window.bossesDB = {
    10: { name: "Rei Goblin", baseHp: 200, baseAtk: 25, icon: "👑", lore: "Você derrotou o Rei Goblin e achou o diário dele. A Princesa Seraphina foi levada para a Floresta de Sangue!" },
    20: { name: "Fera das Sombras", baseHp: 400, baseAtk: 45, icon: "🐺", lore: "A Fera guardava a entrada das cavernas. Você achou um pedaço do vestido da princesa no chão." },
    30: { name: "General Orc", baseHp: 800, baseAtk: 70, icon: "👹", lore: "O General Orc confessou: o Deus da Ruína está usando a alma da princesa para abrir um portal!" },
    40: { name: "Bruxa do Pântano", baseHp: 1200, baseAtk: 100, icon: "🧙‍♀️", lore: "A bruxa caiu. Ela riu e disse que você jamais chegaria ao Palácio flutuante." },
    50: { name: "Dragão Negro", baseHp: 2500, baseAtk: 150, icon: "🐉", lore: "O Dragão protegia o desfiladeiro. Agora o caminho para o reino das sombras está aberto." },
    150: { name: "Deus da Ruína", baseHp: 50000, baseAtk: 2500, icon: "🌌", lore: "O mal supremo caiu! A Princesa Seraphina corre para seus braços. Aethelgard está salva!" }
};

// NPCs E EVENTOS ALEATÓRIOS
window.events = [
    {
        title: "🍻 O Bêbado na Estrada",
        desc: "Um homem cambaleia. 'Ei! Vi uma pista da princesa! Me dá 15 moedas que eu falo!'",
        choices: [
            { text: "💰 Dar 15 Ouro", action: () => { 
                if(window.player.gold >= 15) { window.player.gold -= 15; window.player.potions++; window.ui.log("Ele te deu uma poção e apontou para o Norte!", "loot"); }
                else { window.ui.log("Você não tem ouro e ele te xingou.", "dmg-taken"); }
            }},
            { text: "🗣️ Usar Carisma", action: () => { 
                if(window.player.cha >= 12) { window.player.gold += 20; window.ui.log("Ele se sentiu culpado e te deu 20 moedas!", "loot"); }
                else { window.ui.log("Ele riu da sua cara.", "sys"); }
            }}
        ]
    },
    {
        title: "🧚‍♀️ A Fada Presa",
        desc: "Uma fada está presa em uma teia. Ela brilha intensamente e pede ajuda.",
        choices: [
            { text: "🗡️ Cortar Teia (Força)", action: () => { 
                if(window.player.str >= 10) { window.player.heal(1000); window.ui.log("Ela te curou totalmente!", "loot"); }
                else { window.ui.log("A teia é muito forte.", "sys"); }
            }},
            { text: "🚶 Ignorar", action: () => { window.ui.log("Você seguiu seu caminho.", "sys"); }}
        ]
    }
];

window.player = {
    playerName: "Herói", classObj: null, lvl: 1, xp: 0, xpToNext: 50, gold: 0, potions: 3, highestBossDefeated: 0,
    hp: 0, maxHp: 0, mp: 0, maxMp: 0, baseAtk: 0, baseDef: 0, atk: 0, def: 0, str: 0, dex: 0, spd: 0, cha: 0,
    inventory: [], equipped: { weapon: null, armor: null, offhand: null },

    recalculateStats() {
        let strBonus = Math.floor(this.str / 3); let dexBonus = Math.floor(this.dex / 4);
        this.atk = this.baseAtk + strBonus;
        this.def = this.baseDef + dexBonus;
        window.ui.update();
    },
    gainXp(v) {
        this.xp += v;
        if (this.xp >= this.xpToNext && this.lvl < 150) {
            this.lvl++; this.xp = 0; this.xpToNext = Math.floor(this.xpToNext * 1.5);
            this.maxHp += 20; this.hp = this.maxHp; this.baseAtk += 5; this.baseDef += 2;
            this.str++; this.dex++; this.spd++; this.cha++;
            this.recalculateStats(); window.ui.log(`🎊 Nível UP! Você está no Nvl ${this.lvl}`, "skill");
        }
    },
    heal(v) { this.hp = Math.min(this.hp + v, this.maxHp); window.ui.update(); },
    usePotion() {
        if (this.potions > 0 && this.hp < this.maxHp) { this.potions--; this.heal(60); window.ui.log("🧪 Curou 60 HP!", "loot"); }
        if (window.game.state === 'combat') setTimeout(() => window.combat.enemyTurn(), 800);
    },
    buyPotion() { if (this.gold >= 20) { this.gold -= 20; this.potions++; window.ui.log("🛒 +1 Poção!", "loot"); window.ui.update(); } }
};

window.game = {
    state: 'explore', tempClass: null,
    chooseClass(c) {
        window.game.tempClass = c;
        document.getElementById('class-selection-screen').classList.add('hidden');
        document.getElementById('name-selection-screen').classList.remove('hidden');
    },
    cancelName() {
        document.getElementById('name-selection-screen').classList.add('hidden');
        document.getElementById('class-selection-screen').classList.remove('hidden');
    },
    confirmName() {
        let n = document.getElementById('input-hero-name').value.trim();
        if (!n) { alert("Dê um nome ao herói!"); return; }
        window.player.playerName = n;
        
        let cls = {
            cavaleiro: { icon: "🛡️", name: "Cavaleiro", hp: 120, mp: 20, atk: 12, def: 8, str: 10, dex: 4, spd: 3, cha: 5 },
            mago: { icon: "🧙‍♂️", name: "Mago", hp: 80, mp: 60, atk: 8, def: 2, str: 2, dex: 5, spd: 6, cha: 8 },
            arqueiro: { icon: "🏹", name: "Arqueiro", hp: 95, mp: 30, atk: 15, def: 4, str: 5, dex: 10, spd: 8, cha: 4 },
            anao: { icon: "🪓", name: "Anão", hp: 160, mp: 15, atk: 10, def: 10, str: 12, dex: 2, spd: 2, cha: 3 }
        }[window.game.tempClass];

        window.player.classObj = cls;
        window.player.hp = cls.hp; window.player.maxHp = cls.hp;
        window.player.baseAtk = cls.atk; window.player.baseDef = cls.def;
        window.player.str = cls.str; window.player.dex = cls.dex; window.player.spd = cls.spd; window.player.cha = cls.cha;
        window.player.recalculateStats();

        document.getElementById('hero-name-display').innerText = n;
        document.getElementById('hero-icon').innerText = cls.icon;
        document.getElementById('player-art-icon').innerText = cls.icon;
        document.getElementById('hero-class-name').innerText = cls.name;

        document.getElementById('name-selection-screen').classList.add('hidden');
        
        // INTRODUÇÃO DA HISTÓRIA
        window.ui.triggerPureStory(
            "👑 O Sequestro de Seraphina",
            `O reino de Aethelgard caiu em trevas. A Princesa Seraphina foi levada pelo Deus da Ruína.\n\n${n}, você é nossa última esperança. Resgate-a nos confins do Abismo!`,
            "Começar Jornada",
            () => {
                document.getElementById('main-game-screen').classList.remove('hidden');
                document.getElementById('top-menu').classList.remove('hidden');
                window.ui.log("A aventura começou!", "loot");
            }
        );
    },
    explore() {
        let bossLvl = (window.player.highestBossDefeated || 0) + 10;
        if(window.player.lvl >= bossLvl && window.bossesDB[bossLvl]) {
            window.combat.start(window.bossesDB[bossLvl], true, bossLvl);
            return;
        }
        let r = Math.random();
        if(r < 0.25) window.ui.triggerEvent();
        else if(r < 0.65) window.combat.start({ name: "Monstro", baseHp: 40+(window.player.lvl*10), baseAtk: 10+(window.player.lvl*3), icon: "👹" }, false);
        else { window.player.gold += 15; window.ui.log("Achou 15💰!", "loot"); window.ui.update(); }
    },
    rest() {
        if(window.player.gold >= 10) { window.player.gold -= 10; window.player.heal(1000); window.ui.log("Descansou na pousada.", "loot"); }
        else { window.ui.log("Sem ouro para descansar.", "dmg-taken"); }
    }
};

window.combat = {
    enemy: null, isBoss: false, bossLvl: 0,
    start(e, isBoss, bLvl) {
        this.enemy = JSON.parse(JSON.stringify(e)); this.isBoss = isBoss; this.bossLvl = bLvl;
        this.enemy.maxHp = this.enemy.baseHp;
        document.getElementById('enemy-name-display').innerText = e.name;
        document.getElementById('enemy-art-icon').innerText = e.icon;
        window.game.state = 'combat';
        window.ui.toggleMode(true); window.ui.update();
    },
    attack() {
        let dmg = window.player.atk + Math.floor(Math.random()*5);
        this.enemy.baseHp -= dmg; window.ui.log(`Causou ${dmg} de dano!`, "skill");
        if(this.enemy.baseHp <= 0) this.win();
        else { document.getElementById('combat-actions').style.pointerEvents = 'none'; setTimeout(() => this.enemyTurn(), 800); }
        window.ui.update();
    },
    enemyTurn() {
        let edmg = Math.max(1, this.enemy.baseAtk - window.player.def);
        window.player.hp -= edmg; window.ui.log(`Inimigo causou ${edmg} de dano!`, "dmg-taken");
        document.getElementById('combat-actions').style.pointerEvents = 'auto';
        if(window.player.hp <= 0) { alert("Você morreu!"); location.reload(); }
        window.ui.update();
    },
    win() {
        window.ui.log("Vitória!", "loot"); window.player.gainXp(30 + window.player.lvl*5); window.player.gold += 20;
        if(this.isBoss) {
            window.player.highestBossDefeated = this.bossLvl;
            window.ui.triggerPureStory("História Avança", window.bossesDB[this.bossLvl].lore, "Continuar");
        }
        window.game.state = 'explore'; window.ui.toggleMode(false);
    },
    flee() { window.ui.log("Fugiu!", "sys"); window.game.state = 'explore'; window.ui.toggleMode(false); }
};

window.ui = {
    update() {
        if(!window.player.classObj) return;
        document.getElementById('hp').innerText = window.player.hp;
        document.getElementById('max-hp').innerText = window.player.maxHp;
        document.getElementById('hp-bar').style.width = (window.player.hp / window.player.maxHp * 100) + "%";
        document.getElementById('lvl').innerText = window.player.lvl;
        document.getElementById('gold').innerText = window.player.gold;
        document.getElementById('potions').innerText = window.player.potions;
        document.getElementById('atk-val').innerText = window.player.atk;
        document.getElementById('def-val').innerText = window.player.def;
        document.getElementById('str-val').innerText = window.player.str;
        document.getElementById('spd-val').innerText = window.player.spd;
        document.getElementById('dex-val').innerText = window.player.dex;
        document.getElementById('cha-val').innerText = window.player.cha;
        if(window.game.state === 'combat' && this.enemy) {
             document.getElementById('enemy-hp-bar').style.width = (window.combat.enemy.baseHp / window.combat.enemy.maxHp * 100) + "%";
        }
    },
    log(m, c) {
        let l = document.getElementById('game-log');
        let li = document.createElement('li'); li.innerText = "> " + m; if(c) li.className = c;
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
    },
    openSettings() { document.getElementById('settings-modal').classList.remove('hidden'); },
    closeSettings() { document.getElementById('settings-modal').classList.add('hidden'); },
    openInventory() { document.getElementById('inventory-modal').classList.remove('hidden'); },
    closeInventory() { document.getElementById('inventory-modal').classList.add('hidden'); }
};
