// ==========================================
// ESTADO DO JOGADOR
// ==========================================
var player = {
    classObj: null,
    hp: 0, maxHp: 0, mp: 0, maxMp: 0, 
    baseAtk: 0, baseDef: 0, atk: 0, def: 0, 
    lvl: 1, xp: 0, xpToNext: 50, gold: 0, potions: 3,
    highestBossDefeated: 0,
    
    inventory: [], // A mochila guarda os objetos não equipados
    equipped: { weapon: null, armor: null }, // O corpo do herói

    recalculateStats() {
        // Recalcula o Ataque e a Defesa somando os bônus dos itens equipados
        this.atk = this.baseAtk + (this.equipped.weapon ? this.equipped.weapon.stat : 0);
        this.def = this.baseDef + (this.equipped.armor ? this.equipped.armor.stat : 0);
        ui.update();
    },

    equip(index) {
        let item = this.inventory[index];
        
        // Se já tiver algo equipado naquele lugar (weapon ou armor), devolve pra mochila primeiro
        if (this.equipped[item.type]) {
            this.inventory.push(this.equipped[item.type]);
        }
        
        // Equipa o item e remove da mochila
        this.equipped[item.type] = item;
        this.inventory.splice(index, 1);
        
        this.recalculateStats();
        ui.updateInventoryModal();
        ui.log(`Você vestiu <b>${item.name}</b>.`, "skill");
    },

    unequip(slotType) {
        if (this.equipped[slotType]) {
            this.inventory.push(this.equipped[slotType]);
            this.equipped[slotType] = null;
            this.recalculateStats();
            ui.updateInventoryModal();
        }
    },

    heal(amount) { this.hp = Math.min(this.hp + amount, this.maxHp); ui.update(); },
    restoreMp(amount) { this.mp = Math.min(this.mp + amount, this.maxMp); ui.update(); },
    
    usePotion() {
        if (this.potions <= 0) return ui.log("❌ Sem poções!", "dmg-taken");
        if (this.hp === this.maxHp && this.mp === this.maxMp) return ui.log("Vida e Mana já estão cheios.");
        this.potions--; 
        this.heal(60); 
        this.restoreMp(40);
        ui.log(`🧪 Bebeu poção: +60 Vida, +40 Mana.`, "loot");
        ui.updateInventoryModal(); // Atualiza a contagem no modal, se estiver aberto
        
        if (game.state === 'combat') {
            document.getElementById('inventory-modal').classList.add('hidden'); // Fecha inventario se estiver em combate
            setTimeout(() => combat.enemyTurn(), 800);
        }
    },

    buyPotion() {
        if (this.gold >= 20) { this.gold -= 20; this.potions++; ui.log("🛒 Comprou 1 Poção.", "loot"); ui.update(); } 
        else { ui.log("❌ Ouro insuficiente."); }
    },

    gainXp(amount) {
        if (this.lvl >= 50) return;
        this.xp += amount;
        if (this.xp >= this.xpToNext) {
            this.lvl++; 
            this.xp -= this.xpToNext; 
            this.xpToNext = Math.floor(this.xpToNext * 1.5);
            
            this.maxHp += 15; this.hp = this.maxHp; 
            this.maxMp += 5; this.mp = this.maxMp;
            this.baseAtk += 3;
            this.baseDef += 1; // Fica mais resistente naturalmente
            
            this.recalculateStats();
            ui.log(`🎊 NÍVEL UP! Você alcançou o Nível ${this.lvl}!`, "loot");
        }
    }
};

// ==========================================
// DADOS GERAIS
// ==========================================
var classesData = {
    cavaleiro: { name: "Cavaleiro", icon: "🛡️", hp: 120, mp: 20, atk: 10, def: 5, skillName: "Golpe Duplo", skillCost: 10, skillMult: 2.0 },
    mago: { name: "Mago", icon: "🧙‍♂️", hp: 70, mp: 60, atk: 6, def: 1, skillName: "Bola de Fogo", skillCost: 20, skillMult: 3.5 },
    arqueiro: { name: "Arqueiro", icon: "🏹", hp: 90, mp: 30, atk: 14, def: 3, skillName: "Tiro Preciso", skillCost: 15, skillMult: 2.5 },
    anao: { name: "Anão Guerreiro", icon: "🪓", hp: 160, mp: 15, atk: 9, def: 8, skillName: "Fúria", skillCost: 15, skillMult: 1.8 }
};

var bestiary = [
    { name: "Goblin Rastejante", baseHp: 30, baseAtk: 8, baseXp: 25, baseGold: 10, icon: "👺" },
    { name: "Lobo Faminto", baseHp: 45, baseAtk: 12, baseXp: 40, baseGold: 15, icon: "🐺" },
    { name: "Orc Saqueador", baseHp: 80, baseAtk: 18, baseXp: 70, baseGold: 35, icon: "👹" },
    { name: "Esqueleto Amaldiçoado", baseHp: 60, baseAtk: 15, baseXp: 55, baseGold: 20, icon: "💀" }
];

var bossesDB = {
    10: { name: "Rei Goblin", baseHp: 180, baseAtk: 25, baseXp: 300, baseGold: 100, icon: "👑" },
    20: { name: "Lobo Alfa", baseHp: 250, baseAtk: 40, baseXp: 800, baseGold: 250, icon: "🐺" },
    30: { name: "General Orc", baseHp: 400, baseAtk: 60, baseXp: 2000, baseGold: 500, icon: "🪓" },
    40: { name: "Lich Ancião", baseHp: 600, baseAtk: 85, baseXp: 5000, baseGold: 1000, icon: "💀" },
    50: { name: "Dragão Negro", baseHp: 1200, baseAtk: 130, baseXp: 0, baseGold: 5000, icon: "🐉" }
};

// Agora os itens têm TIPO (Arma ou Armadura) e Bônus de Status
var lootTables = {
    weapons: [
        { name: "Adaga Enferrujada", type: "weapon", stat: 2 },
        { name: "Espada Longa", type: "weapon", stat: 5 },
        { name: "Machado Pesado", type: "weapon", stat: 9 },
        { name: "Lâmina Épica", type: "weapon", stat: 15 }
    ],
    armors: [
        { name: "Túnica de Trapos", type: "armor", stat: 2 },
        { name: "Cota de Malha", type: "armor", stat: 5 },
        { name: "Armadura de Ferro", type: "armor", stat: 10 },
        { name: "Placas Divinas", type: "armor", stat: 18 }
    ]
};

var npcs = [
    { name: "Curandeira Cega", encounter: () => { player.heal(80); ui.log("🧙‍♀️ 'Deixe-me curar suas feridas'. +80 Vida.", "loot"); } },
    { name: "Mendigo Sábio", encounter: () => { player.gainXp(50); ui.log("🧙‍♂️ Ele sussurra segredos antigos. +50 EXP.", "loot"); } },
    { name: "Ladrão Ágil", encounter: () => { if(player.gold > 10) { player.gold -= 10; ui.log("🥷 Furtou 10 de ouro de você!", "dmg-taken"); } else { ui.log("🥷 Um vulto o revista e desiste.", "loot"); } } }
];

// ==========================================
// EXPLORAÇÃO
// ==========================================
var game = {
    state: 'menu',

    chooseClass(classKey) {
        const cls = classesData[classKey];
        player.classObj = cls;
        player.hp = cls.hp; player.maxHp = cls.hp;
        player.mp = cls.mp; player.maxMp = cls.mp;
        
        player.baseAtk = cls.atk;
        player.baseDef = cls.def;
        player.recalculateStats(); // Define Atk e Def oficiais
        
        document.getElementById('hero-icon').innerText = cls.icon;
        document.getElementById('player-art-icon').innerText = cls.icon;
        document.getElementById('hero-class-name').innerText = cls.name;
        document.getElementById('skill-name').innerText = cls.skillName;

        document.getElementById('class-selection-screen').classList.add('hidden');
        document.getElementById('main-game-screen').classList.remove('hidden');
        
        this.state = 'explore';
        ui.log(`Bem-vindo, <b>${cls.name}</b>. A aventura chama!`, "loot");
    },

    explore() {
        let currentDecade = Math.floor(player.lvl / 10) * 10;
        if (currentDecade >= 10 && player.highestBossDefeated < currentDecade) {
            ui.log(`🌩️ O chão treme... Um CHEFÃO se aproxima!`, "dmg-taken");
            setTimeout(() => { combat.start(bossesDB[currentDecade], true, currentDecade); }, 1500);
            return;
        }

        const roll = Math.random();
        
        if (roll < 0.45) { 
            const randomEnemy = bestiary[Math.floor(Math.random() * bestiary.length)];
            combat.start(randomEnemy, false);
        } 
        else if (roll < 0.70) { 
            const foundGold = Math.floor(Math.random() * 20) + 5;
            player.gold += foundGold;
            ui.log(`🌲 Achou um saco com ${foundGold}💰.`, "loot");
            ui.update();
        } 
        else if (roll < 0.85) { 
            // 50% chance de Arma, 50% chance de Armadura
            if(Math.random() > 0.5) {
                const w = lootTables.weapons[Math.floor(Math.random() * lootTables.weapons.length)];
                player.inventory.push(w);
                ui.log(`🎁 Achou uma arma: <b>${w.name}</b>! (Abra a bolsa para equipar)`, "skill");
            } else {
                const a = lootTables.armors[Math.floor(Math.random() * lootTables.armors.length)];
                player.inventory.push(a);
                ui.log(`🛡️ Achou armadura: <b>${a.name}</b>! (Abra a bolsa para vestir)`, "skill");
            }
            ui.update();
        } 
        else { 
            const npc = npcs[Math.floor(Math.random() * npcs.length)];
            ui.log(`⛺ Encontrou <b>${npc.name}</b>.`, "skill");
            npc.encounter();
            ui.update();
        }
    },

    rest() {
        if (player.gold >= 10) {
            if (player.hp === player.maxHp && player.mp === player.maxMp) return ui.log("Você já está descansado.");
            player.gold -= 10; player.hp = player.maxHp; player.mp = player.maxMp;
            ui.log(`🛌 Descansou na pousada. Vida e Mana restaurados!`, "loot"); ui.update();
        } else { ui.log("❌ Ouro insuficiente (10💰)."); }
    }
};

// ==========================================
// COMBATE
// ==========================================
var combat = {
    enemy: null,
    isBossFight: 0, 

    start(enemyData, isBoss = false, bossLevel = 0) {
        game.state = 'combat';
        this.isBossFight = isBoss ? bossLevel : 0;
        
        const scale = 1 + ((player.lvl - 1) * 0.20); 
        
        this.enemy = { 
            name: enemyData.name, 
            hp: Math.floor(enemyData.baseHp * scale), maxHp: Math.floor(enemyData.baseHp * scale), 
            atk: Math.floor(enemyData.baseAtk * scale), 
            xp: Math.floor(enemyData.baseXp * scale), gold: Math.floor(enemyData.baseGold * scale), 
            icon: enemyData.icon, lvl: isBoss ? bossLevel : player.lvl
        };
        
        document.getElementById('battle-arena').style.borderColor = isBoss ? "#ff5252" : "#333";
        ui.log(`⚠️ <b>${this.enemy.name} (Nvl ${this.enemy.lvl})</b> ataca!`, "dmg-taken");
        
        ui.toggleMode(true); ui.update();
    },

    attack() {
        if (!this.enemy || this.enemy.hp <= 0) return;
        ui.animate('player-portrait', 'anim-attack');
        const damage = player.atk + Math.floor(Math.random() * 8);
        this.processPlayerDamage(damage, `⚔️ Ataque: <b>${damage}</b> de dano!`);
    },

    useSkill() {
        if (!this.enemy || this.enemy.hp <= 0) return;
        const cls = player.classObj;
        
        if (player.mp < cls.skillCost) return ui.log(`❌ Sem Mana para ${cls.skillName}`, "dmg-taken");
        
        player.mp -= cls.skillCost;
        ui.update();
        ui.animate('player-portrait', 'anim-attack');
        
        const damage = Math.floor((player.atk * cls.skillMult)) + Math.floor(Math.random() * 15);
        this.processPlayerDamage(damage, `✨ <b>${cls.skillName}</b> causou <b>${damage}</b> de dano!`, "skill");
    },

    processPlayerDamage(damage, logMsg, logClass="dmg-dealt") {
        this.enemy.hp -= damage;
        ui.log(logMsg, logClass);
        ui.animate('enemy-portrait', 'anim-shake'); ui.update();
        document.getElementById('combat-actions').style.pointerEvents = 'none';

        if (this.enemy.hp <= 0) setTimeout(() => this.win(), 800);
        else setTimeout(() => this.enemyTurn(), 1000);
    },

    enemyTurn() {
        if (!this.enemy || player.hp <= 0) return;
        ui.animate('enemy-portrait', 'anim-attack');
        
        // A ARMADURA FUNCIONANDO: O dano do inimigo é diminuído pela Defesa do Jogador! (Mínimo de 1 de dano)
        const rawEnemyDmg = this.enemy.atk + Math.floor(Math.random() * 6);
        const finalDamage = Math.max(1, rawEnemyDmg - player.def); 
        
        player.hp -= finalDamage;
        ui.log(`🩸 O inimigo atacou: <b>${finalDamage}</b> de dano (Aparou ${player.def}🛡️).`, "dmg-taken");
        
        ui.animate('player-portrait', 'anim-shake'); ui.update();
        document.getElementById('combat-actions').style.pointerEvents = 'auto';

        if (player.hp <= 0) this.lose();
    },

    flee() {
        if (this.isBossFight) return ui.log("❌ NÃO PODE FUGIR DE UM CHEFÃO!", "dmg-taken");

        if (Math.random() > 0.4) { ui.log("🏃 Escapou com sucesso!"); this.end(); } 
        else { ui.log("🏃 Fuga bloqueada!", "dmg-taken"); document.getElementById('combat-actions').style.pointerEvents = 'none'; setTimeout(() => this.enemyTurn(), 800); }
    },

    win() {
        ui.log(`🏆 Venceu! +${this.enemy.gold}💰, +${this.enemy.xp} EXP.`, "loot");
        player.gold += this.enemy.gold; 
        player.gainXp(this.enemy.xp); 

        if (this.isBossFight) {
            player.highestBossDefeated = this.isBossFight;
            ui.log(`👑 <b>CHEFÃO DERROTADO!</b>`, "skill");
            
            if (this.isBossFight === 50) {
                setTimeout(() => { alert("🎉 PARABÉNS! Você zerou Aethelgard!"); location.reload(); }, 2000);
                return;
            }
        }
        this.end();
    },

    lose() {
        ui.log(`💀 <b>A SUA LENDA ACABA AQUI...</b>`, "dmg-taken");
        document.getElementById('combat-actions').style.display = 'none';
        setTimeout(() => location.reload(), 4000);
    },

    end() { 
        game.state = 'explore'; 
        this.enemy = null; this.isBossFight = 0;
        document.getElementById('combat-actions').style.pointerEvents = 'auto'; 
        document.getElementById('battle-arena').style.borderColor = "#333";
        ui.toggleMode(false); ui.update(); 
    }
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
        document.getElementById('atk-val').innerText = player.atk;
        document.getElementById('def-val').innerText = player.def;
        document.getElementById('lvl').innerText = player.lvl;
        document.getElementById('gold').innerText = player.gold;
        document.getElementById('potions').innerText = player.potions;

        const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
        document.getElementById('hp-bar').style.width = `${hpPct}%`;
        const mpPct = Math.max(0, (player.mp / player.maxMp) * 100);
        document.getElementById('mp-bar').style.width = `${mpPct}%`;
        const xpPct = player.lvl >= 50 ? 100 : Math.min(100, (player.xp / player.xpToNext) * 100);
        document.getElementById('xp-bar').style.width = `${xpPct}%`;

        if (combat.enemy) {
            document.getElementById('enemy-name-display').innerText = combat.enemy.name;
            document.getElementById('enemy-art-icon').innerText = combat.enemy.icon;
            const enemyHpPct = Math.max(0, (combat.enemy.hp / combat.enemy.maxHp) * 100);
            document.getElementById('enemy-hp-bar').style.width = `${enemyHpPct}%`;
        }
    },

    updateInventoryModal() {
        const equipList = document.getElementById('inv-equipped');
        const bagList = document.getElementById('inv-bag');
        
        // RENDERIZAÇÃO DO QUE ESTÁ VESTIDO
        let eqHTML = "";
        if (player.equipped.weapon) {
            eqHTML += `<li class="inv-item"><span>🗡️ ${player.equipped.weapon.name} (+${player.equipped.weapon.stat} Atk)</span> <button class="inv-btn" onclick="player.unequip('weapon')">Tirar</button></li>`;
        } else { eqHTML += `<li class="inv-item">🗡️ Arma: (Vazio)</li>`; }
        
        if (player.equipped.armor) {
            eqHTML += `<li class="inv-item">🛡️ ${player.equipped.armor.name} (+${player.equipped.armor.stat} Def)</span> <button class="inv-btn" onclick="player.unequip('armor')">Tirar</button></li>`;
        } else { eqHTML += `<li class="inv-item">🛡️ Armadura: (Vazio)</li>`; }
        
        equipList.innerHTML = eqHTML;

        // RENDERIZAÇÃO DA MOCHILA (Para onde os itens vão quando não estão equipados)
        let bagHTML = "";
        
        // Adiciona as poções na mochila
        bagHTML += `<li class="inv-item"><span>🧪 Poções Curativas (x${player.potions})</span> <button class="inv-btn" onclick="player.usePotion()">Beber</button></li>`;

        // Adiciona as Armas e Armaduras soltas
        if (player.inventory.length === 0) {
            bagHTML += "<li class='inv-item' style='text-align:center;'>Nenhum equipamento solto.</li>";
        } else {
            player.inventory.forEach((item, index) => {
                let icon = item.type === 'weapon' ? '🗡️' : '🛡️';
                let statType = item.type === 'weapon' ? 'Atk' : 'Def';
                bagHTML += `<li class="inv-item"><span>${icon} ${item.name} (+${item.stat} ${statType})</span> <button class="inv-btn" onclick="player.equip(${index})">Equipar</button></li>`;
            });
        }
        bagList.innerHTML = bagHTML;
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

// ==========================================
// EXPOSIÇÃO GLOBAL E LIGAÇÃO DE BOTÕES
// ==========================================
window.game = game; window.player = player; window.combat = combat; window.ui = ui;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('btn-cavaleiro').addEventListener('click', () => game.chooseClass('cavaleiro'));
    document.getElementById('btn-mago').addEventListener('click', () => game.chooseClass('mago'));
    document.getElementById('btn-arqueiro').addEventListener('click', () => game.chooseClass('arqueiro'));
    document.getElementById('btn-anao').addEventListener('click', () => game.chooseClass('anao'));
    document.getElementById('btn-inventory').addEventListener('click', () => ui.openInventory());
    document.getElementById('btn-close-inv').addEventListener('click', () => ui.closeInventory());
    document.getElementById('btn-explore').addEventListener('click', () => game.explore());
    document.getElementById('btn-rest').addEventListener('click', () => game.rest());
    document.getElementById('btn-buy-potion').addEventListener('click', () => player.buyPotion());
    document.getElementById('btn-attack').addEventListener('click', () => combat.attack());
    document.getElementById('btn-skill').addEventListener('click', () => combat.useSkill());
    document.getElementById('btn-use-potion').addEventListener('click', () => player.usePotion());
    document.getElementById('btn-flee').addEventListener('click', () => combat.flee());
});
