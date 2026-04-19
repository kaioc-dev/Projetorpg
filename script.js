// ==========================================
// ESTADO DO JOGADOR E INVENTÁRIO (Usando 'var' para acesso global)
// ==========================================
var player = {
    classObj: null,
    hp: 0, maxHp: 0, mp: 0, maxMp: 0, atk: 0, 
    lvl: 1, xp: 0, xpToNext: 50, gold: 0, potions: 3,
    
    // Arrays para guardar os loots
    inventory: {
        equipment: [],
        items: []
    },

    heal(amount) { this.hp = Math.min(this.hp + amount, this.maxHp); ui.update(); },
    restoreMp(amount) { this.mp = Math.min(this.mp + amount, this.maxMp); ui.update(); },
    
    usePotion() {
        if (this.potions <= 0) return ui.log("❌ Sem poções!", "dmg-taken");
        if (this.hp === this.maxHp && this.mp === this.maxMp) return ui.log("Vida e Mana já estão cheios.");
        this.potions--; 
        this.heal(40); 
        this.restoreMp(20);
        ui.log(`🧪 Usou poção: +40 Vida, +20 Mana.`, "loot");
        if (game.state === 'combat') setTimeout(() => combat.enemyTurn(), 800);
    },

    buyPotion() {
        if (this.gold >= 20) { this.gold -= 20; this.potions++; ui.log("🛒 Comprou 1 Poção.", "loot"); ui.update(); } 
        else { ui.log("❌ Ouro insuficiente."); }
    },

    gainXp(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNext) {
            this.lvl++; this.xp -= this.xpToNext; this.xpToNext = Math.floor(this.xpToNext * 1.5);
            this.maxHp += 15; this.hp = this.maxHp; 
            this.maxMp += 5; this.mp = this.maxMp;
            this.atk += 4;
            ui.log(`🎊 NÍVEL UP! Nível ${this.lvl}! (+Atributos)`, "loot");
        }
    },

    addLoot(type, itemName) {
        if(type === 'equip') {
            this.inventory.equipment.push(itemName);
            this.atk += 2; // Bônus passivo de ataque ao achar equipamento
        } else {
            this.inventory.items.push(itemName);
        }
        ui.updateInventoryModal();
    }
};

// ==========================================
// CLASSES DE HERÓI
// ==========================================
var classesData = {
    cavaleiro: { name: "Cavaleiro", icon: "🛡️", hp: 120, mp: 20, atk: 12, skillName: "Golpe Duplo", skillCost: 10, skillMult: 2.2 },
    mago: { name: "Mago", icon: "🧙‍♂️", hp: 70, mp: 60, atk: 8, skillName: "Bola de Fogo", skillCost: 20, skillMult: 3.5 },
    arqueiro: { name: "Arqueiro", icon: "🏹", hp: 90, mp: 30, atk: 15, skillName: "Tiro Preciso", skillCost: 15, skillMult: 2.5 },
    anao: { name: "Anão Guerreiro", icon: "🪓", hp: 150, mp: 15, atk: 10, skillName: "Fúria", skillCost: 15, skillMult: 2.0 }
};

// ==========================================
// BANCO DE DADOS (Monstros, NPCs e Itens)
// ==========================================
var bestiary = [
    { name: "Goblin Rastejante", baseHp: 30, baseAtk: 5, baseXp: 25, baseGold: 10, icon: "👺" },
    { name: "Lobo Faminto", baseHp: 45, baseAtk: 8, baseXp: 40, baseGold: 15, icon: "🐺" },
    { name: "Orc Saqueador", baseHp: 80, baseAtk: 12, baseXp: 70, baseGold: 35, icon: "👹" }
];

var lootTables = {
    equips: ["Espada de Ferro Enferrujada", "Escudo de Madeira", "Anel de Cobre (+Ataque)", "Botas de Couro", "Colar Místico"],
    items: ["Dente de Lobo", "Osso Misterioso", "Pedaço de Tecido Sujo", "Gema Brilhante", "Pó Mágico"]
};

var npcs = [
    { name: "Curandeira Cega", encounter: () => { player.heal(50); ui.log("🧙‍♀️ 'Deixe-me tocar suas feridas'. +50 Vida.", "loot"); } },
    { name: "Mendigo Sábio", encounter: () => { player.gainXp(30); ui.log("🧙‍♂️ Ele sussurra segredos antigos. +30 EXP.", "loot"); ui.update(); } },
    { name: "Ladrão Ágil", encounter: () => { if(player.gold > 5) { player.gold -= 5; ui.log("🥷 Suas moedas estão mais leves! (-5💰)", "dmg-taken"); } else { ui.log("🥷 Um vulto o revista, mas desiste.", "loot"); } ui.update(); } }
];

// ==========================================
// MOTOR DE EVENTOS
// ==========================================
var game = {
    state: 'menu',

    chooseClass(classKey) {
        const cls = classesData[classKey];
        player.classObj = cls;
        player.hp = cls.hp; player.maxHp = cls.hp;
        player.mp = cls.mp; player.maxMp = cls.mp;
        player.atk = cls.atk;
        
        // Atualiza UI baseada na classe
        document.getElementById('hero-icon').innerText = cls.icon;
        document.getElementById('player-art-icon').innerText = cls.icon;
        document.getElementById('hero-class-name').innerText = cls.name;
        document.getElementById('skill-name').innerText = cls.skillName;

        // Troca de tela
        document.getElementById('class-selection-screen').classList.add('hidden');
        document.getElementById('main-game-screen').classList.remove('hidden');
        
        this.state = 'explore';
        ui.log(`Bem-vindo, <b>${cls.name}</b>. Sua jornada começa.`, "loot");
        ui.update();
    },

    explore() {
        const roll = Math.random();
        
        if (roll < 0.40) { // 40% de chance Batalha
            const randomEnemy = bestiary[Math.floor(Math.random() * bestiary.length)];
            combat.start(randomEnemy);
        } 
        else if (roll < 0.65) { // 25% de chance Ouro
            const foundGold = Math.floor(Math.random() * 15) + 5;
            player.gold += foundGold;
            ui.log(`🌲 Achou um saco com ${foundGold}💰.`, "loot");
        } 
        else if (roll < 0.85) { // 20% de chance Encontrar Item
            if(Math.random() > 0.5) {
                const eq = lootTables.equips[Math.floor(Math.random() * lootTables.equips.length)];
                player.addLoot('equip', eq);
                ui.log(`🎁 Achou equipamento: <b>${eq}</b>! (+2 Ataque)`, "loot");
            } else {
                const item = lootTables.items[Math.floor(Math.random() * lootTables.items.length)];
                player.addLoot('item', item);
                ui.log(`🎁 Achou um objeto: <b>${item}</b>.`, "loot");
            }
        } 
        else { // 15% de chance Encontrar NPC
            const npc = npcs[Math.floor(Math.random() * npcs.length)];
            ui.log(`⛺ Você cruzou com <b>${npc.name}</b>.`, "skill");
            npc.encounter();
        }
        ui.update();
    },

    rest() {
        if (player.gold >= 10) {
            if (player.hp === player.maxHp && player.mp === player.maxMp) return ui.log("Você já está descansado.");
            player.gold -= 10; player.hp = player.maxHp; player.mp = player.maxMp;
            ui.log(`🛌 Descansou na pousada. Vida e Mana restaurados!`, "loot"); ui.update();
        } else { ui.log("❌ Ouro insuficiente para dormir."); }
    }
};

// ==========================================
// MOTOR DE COMBATE
// ==========================================
var combat = {
    enemy: null,

    start(enemyData) {
        game.state = 'combat';
        const scale = 1 + ((player.lvl - 1) * 0.20); 
        
        this.enemy = { 
            name: enemyData.name, 
            hp: Math.floor(enemyData.baseHp * scale), maxHp: Math.floor(enemyData.baseHp * scale), 
            atk: Math.floor(enemyData.baseAtk * scale), 
            xp: Math.floor(enemyData.baseXp * scale), gold: Math.floor(enemyData.baseGold * scale), 
            icon: enemyData.icon, lvl: player.lvl
        };
        
        ui.log(`⚠️ <b>${this.enemy.name} (Nvl ${this.enemy.lvl})</b> ataca!`, "dmg-taken");
        ui.toggleMode(true); ui.update();
    },

    attack() {
        if (!this.enemy || this.enemy.hp <= 0) return;
        ui.animate('player-portrait', 'anim-attack');
        const damage = player.atk + Math.floor(Math.random() * 6);
        this.processPlayerDamage(damage, `⚔️ Ataque: <b>${damage}</b> de dano!`);
    },

    useSkill() {
        if (!this.enemy || this.enemy.hp <= 0) return;
        const cls = player.classObj;
        
        if (player.mp < cls.skillCost) {
            return ui.log(`❌ Sem Mana para ${cls.skillName} (${cls.skillCost} MP)`, "dmg-taken");
        }
        
        player.mp -= cls.skillCost;
        ui.update();
        ui.animate('player-portrait', 'anim-attack');
        
        const damage = Math.floor((player.atk * cls.skillMult)) + Math.floor(Math.random() * 10);
        this.processPlayerDamage(damage, `✨ <b>${cls.skillName}</b> causou <b>${damage}</b> de dano!`, "skill");
    },

    processPlayerDamage(damage, logMsg, logClass="dmg-dealt") {
        this.enemy.hp -= damage;
        ui.log(logMsg, logClass);
        ui.animate('enemy-portrait', 'anim-shake'); ui.update();
        document.getElementById('combat-actions').style.pointerEvents = 'none';

        if (this.enemy.hp <= 0) setTimeout(() => this.win(), 600);
        else setTimeout(() => this.enemyTurn(), 800);
    },

    enemyTurn() {
        if (!this.enemy || player.hp <= 0) return;
        ui.animate('enemy-portrait', 'anim-attack');
        const enemyDamage = this.enemy.atk + Math.floor(Math.random() * 4);
        player.hp -= enemyDamage;
        ui.log(`🩸 O inimigo contra-ataca: <b>${enemyDamage}</b> de dano.`, "dmg-taken");
        ui.animate('player-portrait', 'anim-shake'); ui.update();
        document.getElementById('combat-actions').style.pointerEvents = 'auto';

        if (player.hp <= 0) this.lose();
    },

    flee() {
        if (Math.random() > 0.4) { ui.log("🏃 Escapou com sucesso!"); this.end(); } 
        else { ui.log("🏃 Fuga bloqueada!", "dmg-taken"); document.getElementById('combat-actions').style.pointerEvents = 'none'; setTimeout(() => this.enemyTurn(), 800); }
    },

    win() {
        ui.log(`🏆 Venceu! +${this.enemy.gold}💰, +${this.enemy.xp} EXP.`, "loot");
        player.gold += this.enemy.gold; player.gainXp(this.enemy.xp); this.end();
    },

    lose() {
        ui.log(`💀 <b>MORTO.</b> A tela vai reiniciar.`, "dmg-taken");
        document.getElementById('combat-actions').style.display = 'none';
        setTimeout(() => location.reload(), 3000);
    },

    end() { game.state = 'explore'; this.enemy = null; document.getElementById('combat-actions').style.pointerEvents = 'auto'; ui.toggleMode(false); ui.update(); }
};

// ==========================================
// GERENCIADOR UI
// ==========================================
var ui = {
    log(message, className = "") {
        const container = document.getElementById('log-window');
        const ul = document.getElementById('game-log');
        const li = document.createElement('li');
        li.innerHTML = `> ${message}`;
        if (className) li.className = className;
        ul.appendChild(li);
        setTimeout(() => { container.scrollTop = container.scrollHeight; }, 10); 
    },

    update() {
        if(!player.classObj) return; 
        
        document.getElementById('hp').innerText = Math.max(0, player.hp);
        document.getElementById('max-hp').innerText = player.maxHp;
        document.getElementById('mp').innerText = player.mp;
        document.getElementById('max-mp').innerText = player.maxMp;
        document.getElementById('lvl').innerText = player.lvl;
        document.getElementById('gold').innerText = player.gold;
        document.getElementById('potions').innerText = player.potions;

        const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
        document.getElementById('hp-bar').style.width = `${hpPct}%`;
        const mpPct = Math.max(0, (player.mp / player.maxMp) * 100);
        document.getElementById('mp-bar').style.width = `${mpPct}%`;
        const xpPct = Math.min(100, (player.xp / player.xpToNext) * 100);
        document.getElementById('xp-bar').style.width = `${xpPct}%`;

        if (combat.enemy) {
            document.getElementById('enemy-name-display').innerText = combat.enemy.name;
            document.getElementById('enemy-art-icon').innerText = combat.enemy.icon;
            const enemyHpPct = Math.max(0, (combat.enemy.hp / combat.enemy.maxHp) * 100);
            document.getElementById('enemy-hp-bar').style.width = `${enemyHpPct}%`;
        }
    },

    updateInventoryModal() {
        const equipList = document.getElementById('inv-equip');
        const itemsList = document.getElementById('inv-items');
        
        equipList.innerHTML = player.inventory.equipment.length > 0 
            ? player.inventory.equipment.map(i => `<li>🛡️ ${i}</li>`).join('') 
            : "<li>Vazio...</li>";
            
        itemsList.innerHTML = player.inventory.items.length > 0 
            ? player.inventory.items.map(i => `<li>💎 ${i}</li>`).join('') 
            : "<li>Vazio...</li>";
    },

    openInventory() { document.getElementById('inventory-modal').classList.remove('hidden'); this.updateInventoryModal(); },
    closeInventory() { document.getElementById('inventory-modal').classList.add('hidden'); },

    toggleMode(isCombat) {
        document.getElementById('exploration-actions').classList.toggle('hidden', isCombat);
        document.getElementById('combat-actions').classList.toggle('hidden', !isCombat);
        document.getElementById('battle-arena').classList.toggle('hidden', !isCombat);
    },

    animate(elementId, animationClass) {
        const el = document.getElementById(elementId);
        if(!el) return;
        el.classList.remove(animationClass);
        void el.offsetWidth; 
        el.classList.add(animationClass);
        setTimeout(() => el.classList.remove(animationClass), 350);
    }
};
