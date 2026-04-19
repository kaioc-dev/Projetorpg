// ==========================================
// DADOS GERAIS
// ==========================================
window.classesData = {
    cavaleiro: { name: "Cavaleiro", icon: "🛡️", hp: 120, mp: 20, atk: 10, def: 5, skillName: "Golpe Duplo", skillCost: 10, skillMult: 2.0 },
    mago: { name: "Mago", icon: "🧙‍♂️", hp: 70, mp: 60, atk: 6, def: 1, skillName: "Bola de Fogo", skillCost: 20, skillMult: 3.5 },
    arqueiro: { name: "Arqueiro", icon: "🏹", hp: 90, mp: 30, atk: 14, def: 3, skillName: "Tiro Preciso", skillCost: 15, skillMult: 2.5 },
    anao: { name: "Anão Guerreiro", icon: "🪓", hp: 160, mp: 15, atk: 9, def: 8, skillName: "Fúria", skillCost: 15, skillMult: 1.8 }
};

window.bestiary = [
    { name: "Goblin Rastejante", baseHp: 30, baseAtk: 8, baseXp: 25, baseGold: 10, icon: "👺" },
    { name: "Lobo Faminto", baseHp: 45, baseAtk: 12, baseXp: 40, baseGold: 15, icon: "🐺" },
    { name: "Orc Saqueador", baseHp: 80, baseAtk: 18, baseXp: 70, baseGold: 35, icon: "👹" },
    { name: "Esqueleto Amaldiçoado", baseHp: 60, baseAtk: 15, baseXp: 55, baseGold: 20, icon: "💀" }
];

window.bossesDB = {
    10: { name: "Rei Goblin", baseHp: 180, baseAtk: 25, baseXp: 300, baseGold: 100, icon: "👑" },
    20: { name: "Lobo Alfa", baseHp: 250, baseAtk: 40, baseXp: 800, baseGold: 250, icon: "🐺" },
    30: { name: "General Orc", baseHp: 400, baseAtk: 60, baseXp: 2000, baseGold: 500, icon: "🪓" },
    40: { name: "Lich Ancião", baseHp: 600, baseAtk: 85, baseXp: 5000, baseGold: 1000, icon: "💀" },
    50: { name: "Dragão Negro", baseHp: 1200, baseAtk: 130, baseXp: 0, baseGold: 5000, icon: "🐉" }
};

// Loot Atualizado com "Segunda Mão" (offhand)
window.lootTables = {
    weapons: [
        { name: "Adaga Enferrujada", type: "weapon", stat: 2 },
        { name: "Espada Longa", type: "weapon", stat: 5 },
        { name: "Lâmina Épica", type: "weapon", stat: 15 }
    ],
    armors: [
        { name: "Túnica de Trapos", type: "armor", stat: 2 },
        { name: "Cota de Malha", type: "armor", stat: 5 },
        { name: "Placas Divinas", type: "armor", stat: 18 }
    ],
    offhands: [
        { name: "Broquel de Madeira", type: "offhand", adds: "def", stat: 3 },
        { name: "Grimório Arcano", type: "offhand", adds: "atk", stat: 4 },
        { name: "Escudo de Aço", type: "offhand", adds: "def", stat: 8 },
        { name: "Adaga de Aparar", type: "offhand", adds: "atk", stat: 6 }
    ]
};

window.npcs = [
    { name: "Curandeira", encounter: () => { window.player.heal(80); window.ui.log("🧙‍♀️ +80 Vida.", "loot"); } },
    { name: "Mendigo Sábio", encounter: () => { window.player.gainXp(50); window.ui.log("🧙‍♂️ +50 EXP.", "loot"); } },
    { name: "Ladrão Ágil", encounter: () => { if(window.player.gold > 10) { window.player.gold -= 10; window.ui.log("🥷 Furtou 10 Ouro!", "dmg-taken"); } else { window.ui.log("🥷 Desistiu de roubar.", "loot"); } } }
];

// ==========================================
// ESTADO DO JOGADOR
// ==========================================
window.player = {
    classObj: null,
    hp: 0, maxHp: 0, mp: 0, maxMp: 0, 
    baseAtk: 0, baseDef: 0, atk: 0, def: 0, 
    lvl: 1, xp: 0, xpToNext: 50, gold: 0, potions: 3,
    highestBossDefeated: 0,
    
    inventory: [], 
    equipped: { weapon: null, armor: null, offhand: null },

    recalculateStats() {
        let offAtk = (this.equipped.offhand && this.equipped.offhand.adds === 'atk') ? this.equipped.offhand.stat : 0;
        let offDef = (this.equipped.offhand && this.equipped.offhand.adds === 'def') ? this.equipped.offhand.stat : 0;

        this.atk = this.baseAtk + (this.equipped.weapon ? this.equipped.weapon.stat : 0) + offAtk;
        this.def = this.baseDef + (this.equipped.armor ? this.equipped.armor.stat : 0) + offDef;
        window.ui.update();
    },

    equip(index) {
        let item = this.inventory[index];
        if (this.equipped[item.type]) {
            this.inventory.push(this.equipped[item.type]); // Devolve o antigo pra mochila
        }
        this.equipped[item.type] = item;
        this.inventory.splice(index, 1); // Remove o novo da mochila
        
        this.recalculateStats();
        window.ui.updateInventoryModal();
        window.ui.log(`Vestiu <b>${item.name}</b>.`, "skill");
        window.game.saveGame(); // Salva automático ao equipar
    },

    unequip(slotType) {
        if (this.equipped[slotType]) {
            this.inventory.push(this.equipped[slotType]);
            this.equipped[slotType] = null;
            this.recalculateStats();
            window.ui.updateInventoryModal();
            window.game.saveGame();
        }
    },

    heal(amount) { this.hp = Math.min(this.hp + amount, this.maxHp); window.ui.update(); },
    restoreMp(amount) { this.mp = Math.min(this.mp + amount, this.maxMp); window.ui.update(); },
    
    usePotion() {
        if (this.potions <= 0) return window.ui.log("❌ Sem poções!", "dmg-taken");
        if (this.hp === this.maxHp && this.mp === this.maxMp) return window.ui.log("Vida/Mana já estão cheios.");
        this.potions--; 
        this.heal(60); 
        this.restoreMp(40);
        window.ui.log(`🧪 +60 Vida, +40 Mana.`, "loot");
        window.ui.updateInventoryModal();
        
        if (window.game.state === 'combat') {
            document.getElementById('inventory-modal').classList.add('hidden');
            setTimeout(() => window.combat.enemyTurn(), 800);
        } else {
            window.game.saveGame();
        }
    },

    buyPotion() {
        if (this.gold >= 20) { this.gold -= 20; this.potions++; window.ui.log("🛒 Comprou 1 Poção.", "loot"); window.ui.update(); window.game.saveGame(); } 
        else { window.ui.log("❌ Ouro insuficiente."); }
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
            this.baseDef += 1; 
            
            this.recalculateStats();
            window.ui.log(`🎊 NÍVEL UP! Você alcançou o Nível ${this.lvl}!`, "loot");
        }
    }
};

// ==========================================
// SISTEMA PRINCIPAL (Salvar e Explorar)
// ==========================================
window.game = {
    state: 'menu',

    saveGame() {
        if(!window.player.classObj) return; // Não salva no menu
        const saveData = {
            classObj: window.player.classObj,
            hp: window.player.hp, maxHp: window.player.maxHp,
            mp: window.player.mp, maxMp: window.player.maxMp,
            baseAtk: window.player.baseAtk, baseDef: window.player.baseDef,
            lvl: window.player.lvl, xp: window.player.xp, xpToNext: window.player.xpToNext,
            gold: window.player.gold, potions: window.player.potions,
            highestBossDefeated: window.player.highestBossDefeated,
            inventory: window.player.inventory,
            equipped: window.player.equipped
        };
        localStorage.setItem('aethelgard_save', JSON.stringify(saveData));
        window.ui.log("💾 Jogo salvo com sucesso!", "sys");
    },

    loadGame() {
        const saved = localStorage.getItem('aethelgard_save');
        if (saved) {
            const data = JSON.parse(saved);
            Object.assign(window.player, data); // Copia os dados pro player
            window.player.recalculateStats();
            
            // Atualiza Visuais
            document.getElementById('hero-icon').innerText = data.classObj.icon;
            document.getElementById('player-art-icon').innerText = data.classObj.icon;
            document.getElementById('hero-class-name').innerText = data.classObj.name;
            document.getElementById('skill-name').innerText = data.classObj.skillName;

            document.getElementById('class-selection-screen').classList.add('hidden');
            document.getElementById('main-game-screen').classList.remove('hidden');
            
            this.state = 'explore';
            window.ui.log(`💾 Jogo Carregado! Bem-vindo de volta, <b>${data.classObj.name}</b>.`, "sys");
            window.ui.update();
            return true;
        }
        return false;
    },

    resetGame() {
        if(confirm("Tem certeza que deseja apagar seu progresso? Isso não pode ser desfeito.")) {
            localStorage.removeItem('aethelgard_save');
            location.reload();
        }
    },

    chooseClass(classKey) {
        const cls = window.classesData[classKey];
        window.player.classObj = cls;
        window.player.hp = cls.hp; window.player.maxHp = cls.hp;
        window.player.mp = cls.mp; window.player.maxMp = cls.mp;
        window.player.baseAtk = cls.atk; window.player.baseDef = cls.def;
        
        window.player.recalculateStats();
        
        document.getElementById('hero-icon').innerText = cls.icon;
        document.getElementById('player-art-icon').innerText = cls.icon;
        document.getElementById('hero-class-name').innerText = cls.name;
        document.getElementById('skill-name').innerText = cls.skillName;

        document.getElementById('class-selection-screen').classList.add('hidden');
        document.getElementById('main-game-screen').classList.remove('hidden');
        
        this.state = 'explore';
        window.ui.log(`Bem-vindo, <b>${cls.name}</b>. A aventura chama!`, "loot");
        this.saveGame(); // Salva inicial
    },

    explore() {
        let currentDecade = Math.floor(window.player.lvl / 10) * 10;
        if (currentDecade >= 10 && window.player.highestBossDefeated < currentDecade) {
            window.ui.log(`🌩️ O chão treme... Um CHEFÃO se aproxima!`, "dmg-taken");
            setTimeout(() => { window.combat.start(window.bossesDB[currentDecade], true, currentDecade); }, 1500);
            return;
        }

        const roll = Math.random();
        
        if (roll < 0.45) { 
            const randomEnemy = window.bestiary[Math.floor(Math.random() * window.bestiary.length)];
            window.combat.start(randomEnemy, false);
        } 
        else if (roll < 0.70) { 
            const foundGold = Math.floor(Math.random() * 20) + 5;
            window.player.gold += foundGold;
            window.ui.log(`🌲 Achou um saco com ${foundGold}💰.`, "loot");
            window.ui.update();
            this.saveGame(); // Auto-save
        } 
        else if (roll < 0.85) { 
            // 33% Arma, 33% Armadura, 33% Segunda Mão
            const itemRoll = Math.random();
            let drop;
            if(itemRoll < 0.33) {
                drop = window.lootTables.weapons[Math.floor(Math.random() * window.lootTables.weapons.length)];
                window.ui.log(`🎁 Achou arma: <b>${drop.name}</b>!`, "skill");
            } else if(itemRoll < 0.66) {
                drop = window.lootTables.armors[Math.floor(Math.random() * window.lootTables.armors.length)];
                window.ui.log(`🛡️ Achou armadura: <b>${drop.name}</b>!`, "skill");
            } else {
                drop = window.lootTables.offhands[Math.floor(Math.random() * window.lootTables.offhands.length)];
                window.ui.log(`🎒 Achou item de mão secundária: <b>${drop.name}</b>!`, "skill");
            }
            window.player.inventory.push(drop);
            window.ui.update();
            this.saveGame(); // Auto-save
        } 
        else { 
            const npc = window.npcs[Math.floor(Math.random() * window.npcs.length)];
            window.ui.log(`⛺ Encontrou <b>${npc.name}</b>.`, "sys");
            npc.encounter();
            window.ui.update();
            this.saveGame(); // Auto-save
        }
    },

    rest() {
        if (window.player.gold >= 10) {
            if (window.player.hp === window.player.maxHp && window.player.mp === window.player.maxMp) return window.ui.log("Você já está descansado.");
            window.player.gold -= 10; window.player.hp = window.player.maxHp; window.player.mp = window.player.maxMp;
            window.ui.log(`🛌 Descansou na pousada.`, "loot"); window.ui.update();
            this.saveGame();
        } else { window.ui.log("❌ Ouro insuficiente (10💰)."); }
    }
};

// ==========================================
// COMBATE
// ==========================================
window.combat = {
    enemy: null,
    isBossFight: 0, 

    start(enemyData, isBoss = false, bossLevel = 0) {
        window.game.state = 'combat';
        this.isBossFight = isBoss ? bossLevel : 0;
        const scale = 1 + ((window.player.lvl - 1) * 0.20); 
        
        this.enemy = { 
            name: enemyData.name, 
            hp: Math.floor(enemyData.baseHp * scale), maxHp: Math.floor(enemyData.baseHp * scale), 
            atk: Math.floor(enemyData.baseAtk * scale), 
            xp: Math.floor(enemyData.baseXp * scale), gold: Math.floor(enemyData.baseGold * scale), 
            icon: enemyData.icon, lvl: isBoss ? bossLevel : window.player.lvl
        };
        
        document.getElementById('battle-arena').style.borderColor = isBoss ? "#ff5252" : "#333";
        window.ui.log(`⚠️ <b>${this.enemy.name} (Nvl ${this.enemy.lvl})</b> ataca!`, "dmg-taken");
        
        window.ui.toggleMode(true); window.ui.update();
    },

    attack() {
        if (!this.enemy || this.enemy.hp <= 0) return;
        window.ui.animate('player-portrait', 'anim-attack');
        const damage = window.player.atk + Math.floor(Math.random() * 8);
        this.processPlayerDamage(damage, `⚔️ Ataque: <b>${damage}</b> de dano!`);
    },

    useSkill() {
        if (!this.enemy || this.enemy.hp <= 0) return;
        const cls = window.player.classObj;
        
        if (window.player.mp < cls.skillCost) return window.ui.log(`❌ Sem Mana para ${cls.skillName}`, "dmg-taken");
        
        window.player.mp -= cls.skillCost;
        window.ui.update();
        window.ui.animate('player-portrait', 'anim-attack');
        
        const damage = Math.floor((window.player.atk * cls.skillMult)) + Math.floor(Math.random() * 15);
        this.processPlayerDamage(damage, `✨ <b>${cls.skillName}</b> causou <b>${damage}</b> de dano!`, "skill");
    },

    processPlayerDamage(damage, logMsg, logClass="dmg-dealt") {
        this.enemy.hp -= damage;
        window.ui.log(logMsg, logClass);
        window.ui.animate('enemy-portrait', 'anim-shake'); window.ui.update();
        document.getElementById('combat-actions').style.pointerEvents = 'none';

        if (this.enemy.hp <= 0) setTimeout(() => this.win(), 800);
        else setTimeout(() => this.enemyTurn(), 1000);
    },

    enemyTurn() {
        if (!this.enemy || window.player.hp <= 0) return;
        window.ui.animate('enemy-portrait', 'anim-attack');
        
        const rawEnemyDmg = this.enemy.atk + Math.floor(Math.random() * 6);
        const finalDamage = Math.max(1, rawEnemyDmg - window.player.def); 
        
        window.player.hp -= finalDamage;
        window.ui.log(`🩸 O inimigo atacou: <b>${finalDamage}</b> de dano (Aparou ${window.player.def}🛡️).`, "dmg-taken");
        
        window.ui.animate('player-portrait', 'anim-shake'); window.ui.update();
        document.getElementById('combat-actions').style.pointerEvents = 'auto';

        if (window.player.hp <= 0) this.lose();
    },

    flee() {
        if (this.isBossFight) return window.ui.log("❌ NÃO PODE FUGIR DE UM CHEFÃO!", "dmg-taken");

        if (Math.random() > 0.4) { window.ui.log("🏃 Escapou com sucesso!"); this.end(); } 
        else { window.ui.log("🏃 Fuga bloqueada!", "dmg-taken"); document.getElementById('combat-actions').style.pointerEvents = 'none'; setTimeout(() => this.enemyTurn(), 800); }
    },

    win() {
        window.ui.log(`🏆 Venceu! +${this.enemy.gold}💰, +${this.enemy.xp} EXP.`, "loot");
        window.player.gold += this.enemy.gold; 
        window.player.gainXp(this.enemy.xp); 

        if (this.isBossFight) {
            window.player.highestBossDefeated = this.isBossFight;
            window.ui.log(`👑 <b>CHEFÃO DERROTADO!</b>`, "skill");
            
            if (this.isBossFight === 50) {
                setTimeout(() => { alert("🎉 PARABÉNS! Você zerou Aethelgard!"); location.reload(); }, 2000);
                return;
            }
        }
        window.game.saveGame(); // Salva ao fim de toda batalha ganha
        this.end();
    },

    lose() {
        window.ui.log(`💀 <b>A SUA LENDA ACABA AQUI...</b> O save foi apagado.`, "dmg-taken");
        document.getElementById('combat-actions').style.display = 'none';
        localStorage.removeItem('aethelgard_save'); // Permadeath!
        setTimeout(() => location.reload(), 5000);
    },

    end() { 
        window.game.state = 'explore'; 
        this.enemy = null; this.isBossFight = 0;
        document.getElementById('combat-actions').style.pointerEvents = 'auto'; 
        document.getElementById('battle-arena').style.borderColor = "#333";
        window.ui.toggleMode(false); window.ui.update(); 
    }
};

// ==========================================
// GERENCIADOR UI
// ==========================================
window.ui = {
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
        if(!window.player.classObj) return; 
        
        document.getElementById('hp').innerText = Math.max(0, window.player.hp);
        document.getElementById('max-hp').innerText = window.player.maxHp;
        document.getElementById('mp').innerText = window.player.mp;
        document.getElementById('max-mp').innerText = window.player.maxMp;
        document.getElementById('atk-val').innerText = window.player.atk;
        document.getElementById('def-val').innerText = window.player.def;
        document.getElementById('lvl').innerText = window.player.lvl;
        document.getElementById('gold').innerText = window.player.gold;
        document.getElementById('potions').innerText = window.player.potions;

        const hpPct = Math.max(0, (window.player.hp / window.player.maxHp) * 100);
        document.getElementById('hp-bar').style.width = `${hpPct}%`;
        const mpPct = Math.max(0, (window.player.mp / window.player.maxMp) * 100);
        document.getElementById('mp-bar').style.width = `${mpPct}%`;
        const xpPct = window.player.lvl >= 50 ? 100 : Math.min(100, (window.player.xp / window.player.xpToNext) * 100);
        document.getElementById('xp-bar').style.width = `${xpPct}%`;

        if (window.combat.enemy) {
            document.getElementById('enemy-name-display').innerText = window.combat.enemy.name;
            document.getElementById('enemy-art-icon').innerText = window.combat.enemy.icon;
            const enemyHpPct = Math.max(0, (window.combat.enemy.hp / window.combat.enemy.maxHp) * 100);
            document.getElementById('enemy-hp-bar').style.width = `${enemyHpPct}%`;
        }
    },

    updateInventoryModal() {
        const equipList = document.getElementById('inv-equipped');
        const bagList = document.getElementById('inv-bag');
        
        let eqHTML = "";
        
        // Slot Arma
        if (window.player.equipped.weapon) {
            eqHTML += `<li class="inv-item"><span>🗡️ ${window.player.equipped.weapon.name} (+${window.player.equipped.weapon.stat} Atk)</span> <button class="inv-btn" onclick="window.player.unequip('weapon')">Tirar</button></li>`;
        } else { eqHTML += `<li class="inv-item">🗡️ Arma: (Vazio)</li>`; }
        
        // Slot Segunda Mão
        if (window.player.equipped.offhand) {
            let sType = window.player.equipped.offhand.adds === 'atk' ? 'Atk' : 'Def';
            eqHTML += `<li class="inv-item"><span>🎒 ${window.player.equipped.offhand.name} (+${window.player.equipped.offhand.stat} ${sType})</span> <button class="inv-btn" onclick="window.player.unequip('offhand')">Tirar</button></li>`;
        } else { eqHTML += `<li class="inv-item">🎒 Mão Secundária: (Vazio)</li>`; }

        // Slot Armadura
        if (window.player.equipped.armor) {
            eqHTML += `<li class="inv-item"><span>🛡️ ${window.player.equipped.armor.name} (+${window.player.equipped.armor.stat} Def)</span> <button class="inv-btn" onclick="window.player.unequip('armor')">Tirar</button></li>`;
        } else { eqHTML += `<li class="inv-item">🛡️ Armadura: (Vazio)</li>`; }
        
        equipList.innerHTML = eqHTML;

        let bagHTML = "";
        bagHTML += `<li class="inv-item"><span>🧪 Poções Curativas (x${window.player.potions})</span> <button class="inv-btn" onclick="window.player.usePotion()">Beber</button></li>`;

        if (window.player.inventory.length === 0) {
            bagHTML += "<li class='inv-item' style='text-align:center;'>Nenhum equipamento solto.</li>";
        } else {
            window.player.inventory.forEach((item, index) => {
                let icon = item.type === 'weapon' ? '🗡️' : (item.type === 'armor' ? '🛡️' : '🎒');
                let statType = item.type === 'weapon' ? 'Atk' : (item.type === 'armor' ? 'Def' : (item.adds === 'atk' ? 'Atk' : 'Def'));
                bagHTML += `<li class="inv-item"><span>${icon} ${item.name} (+${item.stat} ${statType})</span> <button class="inv-btn" onclick="window.player.equip(${index})">Equipar</button></li>`;
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

// Quando a página carregar, tenta buscar um Save!
document.addEventListener("DOMContentLoaded", () => {
    window.game.loadGame();
});
