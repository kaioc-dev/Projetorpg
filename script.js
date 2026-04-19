function handleCredentialResponse(response) {
    console.log("Token do Google recebido:", response.credential);
    window.ui.log("☁️ Conta Google conectada com sucesso!", "sys");
    document.getElementById('txt-cloud-info').innerText = "Conta conectada. Progresso sincronizado!";
}

window.audio = {
    bgm: new Audio('bgm.mp3'), clickSfx: new Audio('click.mp3'),
    attackSfx: new Audio('attack.mp3'), gruntSfx: new Audio('grunt.mp3'), bgmStarted: false,
    init() { this.bgm.loop = true; this.bgm.volume = 0.3; this.clickSfx.volume = 0.7; this.attackSfx.volume = 1.0; this.gruntSfx.volume = 0.8; },
    startBGM() { if (!this.bgmStarted) { let p = this.bgm.play(); if (p !== undefined) { p.then(() => { this.bgmStarted = true; }).catch(e => {}); } } },
    playClick() { this.clickSfx.currentTime = 0; this.clickSfx.play().catch(()=>{}); },
    playAttack() { this.attackSfx.currentTime = 0; this.attackSfx.play().catch(()=>{}); },
    playGrunt() { this.gruntSfx.currentTime = 0; this.gruntSfx.play().catch(()=>{}); }
};
window.audio.init();

window.lang = 'pt';
const i18n = {
    pt: {
        choose: "Escolha seu destino:", explore: "🌲 Explorar", rest: "🛌 Pousada (10💰)", buy: "🛒 Comprar Poção (20💰)",
        attack: "⚔️ Atacar!", potion: "🧪 Poção", flee: "🏃 Fugir", bag: "🎒 Bolsa", gold: "Ouro", potions: "Poções",
        you: "Você", lvl: "Nvl", atk: "Atk", def: "Def", open_bag: "(Toque para abrir)",
        invTitle: "🎒 Equipamentos", equipped: "🤺 Corpo", bagItems: "📦 Mochila",
        settings: "⚙️ Sistema", lang: "Idioma", saveGame: "💾 Salvar Local e Sair", resetGame: "⚠️ Apagar Save",
        closeSet: "Voltar ao Jogo", unequip: "Tirar", equip: "Equipar", sell: "Vender", use: "Beber", empty: "Vazio"
    },
    en: {
        choose: "Choose your destiny:", explore: "🌲 Explore", rest: "🛌 Inn (10💰)", buy: "🛒 Buy Potion (20💰)",
        attack: "⚔️ Attack!", potion: "🧪 Potion", flee: "🏃 Flee", bag: "🎒 Bag", gold: "Gold", potions: "Potions",
        you: "You", lvl: "Lvl", atk: "Atk", def: "Def", open_bag: "(Tap to open)",
        invTitle: "🎒 Equipment", equipped: "🤺 Body", bagItems: "📦 Backpack",
        settings: "⚙️ System", lang: "Language", saveGame: "💾 Local Save & Exit", resetGame: "⚠️ Erase Save",
        closeSet: "Back to Game", unequip: "Unequip", equip: "Equip", sell: "Sell", use: "Drink", empty: "Empty"
    }
};

window.sys = {
    setLang(l) {
        window.audio.playClick(); window.lang = l; const d = i18n[l];
        document.getElementById('txt-choose').innerText = d.choose; document.getElementById('btn-explore').innerText = d.explore;
        document.getElementById('btn-rest').innerText = d.rest; document.getElementById('btn-buy-potion').innerText = d.buy;
        document.getElementById('btn-attack').innerText = d.attack; document.getElementById('btn-use-potion').innerText = d.potion;
        document.getElementById('btn-flee').innerText = d.flee; document.getElementById('txt-bag').innerText = d.bag;
        document.getElementById('txt-open-bag').innerText = d.open_bag; document.getElementById('txt-inv-title').innerText = d.invTitle;
        document.getElementById('txt-equipped').innerText = d.equipped; document.getElementById('txt-bag-items').innerText = d.bagItems;
        document.getElementById('txt-settings-title').innerText = d.settings; document.getElementById('txt-lang').innerText = d.lang;
        document.getElementById('txt-save').innerText = d.saveGame; document.getElementById('txt-reset').innerText = d.resetGame;
        document.getElementById('txt-close-settings').innerText = d.closeSet;
        if(window.player && window.player.classObj) window.ui.updateInventoryModal();
    },
    exitSave() { window.audio.playClick(); window.game.saveGame(); location.reload(); }
};

window.classesData = {
    cavaleiro: { name: "Cavaleiro", icon: "🛡️", hp: 120, mp: 20, atk: 10, def: 5, str: 8, dex: 4, spd: 3, cha: 5, skillName: "Golpe Duplo", skillCost: 10, skillMult: 2.0 },
    mago: { name: "Mago", icon: "🧙‍♂️", hp: 70, mp: 60, atk: 6, def: 1, str: 2, dex: 5, spd: 6, cha: 7, skillName: "Bola de Fogo", skillCost: 20, skillMult: 3.5 },
    arqueiro: { name: "Arqueiro", icon: "🏹", hp: 90, mp: 30, atk: 14, def: 3, str: 4, dex: 9, spd: 8, cha: 4, skillName: "Tiro Preciso", skillCost: 15, skillMult: 2.5 },
    anao: { name: "Anão", icon: "🪓", hp: 160, mp: 15, atk: 9, def: 8, str: 10, dex: 3, spd: 2, cha: 3, skillName: "Fúria", skillCost: 15, skillMult: 1.8 }
};
window.bestiary = [ { name: "Goblin", baseHp: 30, baseAtk: 8, baseXp: 25, baseGold: 10, icon: "👺" }, { name: "Lobo", baseHp: 45, baseAtk: 12, baseXp: 40, baseGold: 15, icon: "🐺" }, { name: "Orc", baseHp: 80, baseAtk: 18, baseXp: 70, baseGold: 35, icon: "👹" }, { name: "Cultista", baseHp: 60, baseAtk: 15, baseXp: 55, baseGold: 20, icon: "🦹" } ];
window.bossesDB = { 10: { name: "Rei Goblin", baseHp: 180, baseAtk: 25, baseXp: 300, baseGold: 100, icon: "👑" }, 20: { name: "Lobo Alfa", baseHp: 250, baseAtk: 40, baseXp: 800, baseGold: 250, icon: "🐺" }, 30: { name: "General Orc", baseHp: 400, baseAtk: 60, baseXp: 2000, baseGold: 500, icon: "🪓" }, 40: { name: "Sumo Sacerdote", baseHp: 600, baseAtk: 85, baseXp: 5000, baseGold: 1000, icon: "👁️" }, 50: { name: "Dragão Negro", baseHp: 1200, baseAtk: 130, baseXp: 10000, baseGold: 5000, icon: "🐉" }, 100: { name: "Titã Esquecido", baseHp: 5000, baseAtk: 300, baseXp: 50000, baseGold: 20000, icon: "🗿" }, 150: { name: "Deus da Ruína", baseHp: 15000, baseAtk: 800, baseXp: 0, baseGold: 100000, icon: "🌌" }};
window.lootTables = {
    weapons: [ { name: "Adaga", type: "weapon", stat: 2 }, { name: "Espada Longa", type: "weapon", stat: 5 }, { name: "Lâmina Épica", type: "weapon", stat: 15 } ],
    armors: [ { name: "Túnica", type: "armor", stat: 2 }, { name: "Cota de Malha", type: "armor", stat: 5 }, { name: "Placas Divinas", type: "armor", stat: 18 } ],
    offhands: [ { name: "Broquel", type: "offhand", adds: "def", stat: 3 }, { name: "Grimório", type: "offhand", adds: "atk", stat: 4 }, { name: "Escudo Divino", type: "offhand", adds: "def", stat: 10 } ]
};

// -----------------------------------------------------
// HISTÓRIA DINÂMICA
// -----------------------------------------------------
window.events = [
    {
        title: "🥷 O Espião Sombrio",
        desc: "Um homem encapuzado te observa das sombras. Ele ostenta o símbolo do Deus da Ruína no peito. 'Desista de procurar a Princesa Seraphina', ele avisa.",
        choices: [
            {
                text: "💪 Interrogar à força (Força ou Carisma)",
                action: () => {
                    if (window.player.str >= 10 || window.player.cha >= 12) {
                        window.ui.log("🗣️ O espião treme de medo. Ele revela que a Princesa foi levada além do covil do Dragão Negro antes de fugir, deixando 20💰!", "loot");
                        window.player.gold += 20;
                    } else {
                        window.ui.log("🩸 Ele ri, te atinge com uma adaga envenenada e foge nas sombras!", "dmg-taken");
                        window.player.hp = Math.max(1, window.player.hp - 20);
                    }
                }
            },
            {
                text: "💨 Atacar rapidamente (Exige Velocidade)",
                action: () => {
                    if (window.player.spd >= 8) {
                        window.ui.log("💨 Você o desarma! Ele deixa cair um Mapa Antigo (+EXP) antes de sumir.", "skill");
                        window.player.gainXp(150);
                    } else {
                        window.ui.log("🥷 Ele foi mais rápido. Jogou areia nos seus olhos e sumiu.", "sys");
                    }
                }
            }
        ]
    },
    {
        title: "⛺ O Acampamento Destruído",
        desc: "Você encontra os destroços da Guarda Real de Aethelgard. Foi aqui que a emboscada aconteceu. Um soldado agoniza no chão.",
        choices: [
            {
                text: "🧪 Dar uma Poção para salvá-lo",
                action: () => {
                    if (window.player.potions > 0) {
                        window.player.potions--;
                        window.ui.log("✨ O soldado sobrevive! Agradecido, ele te ensina uma técnica da guarda: Defesa permanente aumentada!", "skill");
                        window.player.baseDef += 1; window.player.recalculateStats();
                    } else { window.ui.log("❌ Você não tem poções. O soldado deu seu último suspiro.", "dmg-taken"); }
                }
            },
            {
                text: "🔍 Procurar pistas (Exige Destreza)",
                action: () => {
                    if (window.player.dex >= 10) {
                        window.ui.log("🔓 Perto da carroça, você achou a presilha de cabelo da princesa de ouro maciço! (Vendida por 50💰)", "loot");
                        window.player.gold += 50;
                    } else {
                        window.ui.log("💥 Ao mexer nos destroços, uma armadilha deixada pelos cultistas explodiu!", "dmg-taken");
                        window.player.hp = Math.max(1, window.player.hp - 15);
                    }
                }
            }
        ]
    },
    {
        title: "🙏 O Altar da Deusa da Luz",
        desc: "Em contraste com as trevas recentes, uma estátua da antiga deusa da luz brilha suavemente, oferecendo um refúgio da influência do Deus da Ruína.",
        choices: [
            {
                text: "🗣️ Orar pela segurança da Princesa (Exige Carisma)",
                action: () => {
                    if (window.player.cha >= 8) {
                        window.ui.log("🌿 A deusa ouve sua prece. Você é banhado em luz e completamente curado!", "loot");
                        window.player.heal(window.player.maxHp); window.player.restoreMp(window.player.maxMp);
                    } else {
                        window.ui.log("🚶 Você orou, mas os deuses parecem distantes hoje.", "sys");
                    }
                }
            },
            {
                text: "🗡️ Afiar a arma no altar sacrilégio (-15 HP)",
                action: () => {
                    if (window.player.hp > 15) {
                        window.player.hp -= 15; window.player.baseAtk += 2; window.player.recalculateStats();
                        window.ui.log("🌑 A luz se apaga. Sua arma fica mais letal, mas sua alma sofre o custo.", "skill");
                    } else { window.ui.log("💀 Você está muito fraco para isso.", "sys"); }
                }
            }
        ]
    }
];

window.player = {
    playerName: "Herói", classObj: null, lvl: 1, xp: 0, xpToNext: 50, gold: 0, potions: 3, highestBossDefeated: 0,
    hp: 0, maxHp: 0, mp: 0, maxMp: 0, baseAtk: 0, baseDef: 0, atk: 0, def: 0, str: 0, dex: 0, spd: 0, cha: 0,
    inventory: [], equipped: { weapon: null, armor: null, offhand: null },

    recalculateStats() {
        let offAtk = (this.equipped.offhand && this.equipped.offhand.adds === 'atk') ? this.equipped.offhand.stat : 0;
        let offDef = (this.equipped.offhand && this.equipped.offhand.adds === 'def') ? this.equipped.offhand.stat : 0;
        let strBonus = Math.floor(this.str / 3); let dexBonus = Math.floor(this.dex / 4);
        this.atk = this.baseAtk + (this.equipped.weapon ? this.equipped.weapon.stat : 0) + offAtk + strBonus;
        this.def = this.baseDef + (this.equipped.armor ? this.equipped.armor.stat : 0) + offDef + dexBonus;
        window.ui.update();
    },

    equip(i) {
        window.audio.playClick(); let item = this.inventory[i];
        if (this.equipped[item.type]) this.inventory.push(this.equipped[item.type]);
        this.equipped[item.type] = item; this.inventory.splice(i, 1);
        this.recalculateStats(); window.ui.updateInventoryModal(); window.game.saveGame();
    },
    unequip(s) { window.audio.playClick(); if (this.equipped[s]) { this.inventory.push(this.equipped[s]); this.equipped[s] = null; this.recalculateStats(); window.ui.updateInventoryModal(); window.game.saveGame(); } },
    sell(i) {
        window.audio.playClick(); let item = this.inventory[i];
        let sellPrice = (item.stat * 5) + Math.floor(this.cha / 2); 
        this.gold += sellPrice; this.inventory.splice(i, 1);
        window.ui.log(`💰 Vendeu ${item.name} por ${sellPrice} ouro.`, "loot");
        window.ui.update(); window.ui.updateInventoryModal(); window.game.saveGame();
    },

    heal(v) { this.hp = Math.min(this.hp + v, this.maxHp); window.ui.update(); },
    restoreMp(v) { this.mp = Math.min(this.mp + v, this.maxMp); window.ui.update(); },
    
    usePotion() {
        window.audio.playClick();
        if (this.potions <= 0) return window.ui.log("❌ Sem poções!", "dmg-taken");
        if (this.hp === this.maxHp && this.mp === this.maxMp) return;
        this.potions--; this.heal(60); this.restoreMp(40);
        window.ui.log(`🧪 Curou/Healed.`, "loot"); window.ui.updateInventoryModal();
        if (window.game.state === 'combat') { document.getElementById('inventory-modal').classList.add('hidden'); setTimeout(() => window.combat.enemyTurn(), 800); } 
        else window.game.saveGame();
    },
    buyPotion() {
        window.audio.playClick();
        let price = Math.max(5, 20 - Math.floor(this.cha / 5));
        if (this.gold >= price) { this.gold -= price; this.potions++; window.ui.log(`🛒 +1 Poção (${price}💰).`, "loot"); window.ui.update(); window.game.saveGame(); } 
        else window.ui.log("❌ Ouro insuficiente.");
    },

    gainXp(v) {
        if (this.lvl >= 150) return;
        this.xp += v;
        if (this.xp >= this.xpToNext) {
            this.lvl++; this.xp -= this.xpToNext; this.xpToNext = Math.floor(this.xpToNext * 1.5);
            this.maxHp += 15; this.hp = this.maxHp; this.maxMp += 5; this.mp = this.maxMp; this.baseAtk += 3; this.baseDef += 1; 
            this.str += Math.floor(Math.random() * 2) + 1; this.dex += Math.floor(Math.random() * 2) + 1;
            this.spd += Math.floor(Math.random() * 2) + 1; this.cha += Math.floor(Math.random() * 2) + 1;
            this.recalculateStats(); window.ui.log(`🎊 NÍVEL UP: ${this.lvl}!`, "loot");
        }
    }
};

window.game = {
    state: 'menu', tempClassKey: null,
    saveGame() { if (!window.player.classObj) return; localStorage.setItem('aethelgard_save', JSON.stringify(window.player)); },
    loadGame() {
        try {
            const saved = localStorage.getItem('aethelgard_save');
            if (saved) {
                Object.assign(window.player, JSON.parse(saved));
                window.player.str = window.player.str || window.player.classObj.str; window.player.dex = window.player.dex || window.player.classObj.dex;
                window.player.spd = window.player.spd || window.player.classObj.spd; window.player.cha = window.player.cha || window.player.classObj.cha;
                
                document.getElementById('hero-name-display').innerText = window.player.playerName || "Herói";
                document.getElementById('hero-icon').innerText = window.player.classObj.icon; document.getElementById('player-art-icon').innerText = window.player.classObj.icon;
                document.getElementById('hero-class-name').innerText = window.player.classObj.name; document.getElementById('skill-name').innerText = window.player.classObj.skillName;

                document.getElementById('class-selection-screen').classList.add('hidden');
                if (document.getElementById('name-selection-screen')) document.getElementById('name-selection-screen').classList.add('hidden');
                document.getElementById('main-game-screen').classList.remove('hidden'); document.getElementById('top-menu').classList.remove('hidden');
                
                this.state = 'explore'; window.player.recalculateStats(); 
                document.body.addEventListener('click', () => { window.audio.startBGM(); }, { once: true }); return true;
            }
        } catch(e) { localStorage.removeItem('aethelgard_save'); } return false;
    },
    resetGame() { window.audio.playClick(); if(confirm(window.lang==='pt'?"Apagar todo seu progresso?":"Delete all progress?")) { localStorage.removeItem('aethelgard_save'); location.reload(); } },
    
    chooseClass(key) { window.audio.playClick(); this.tempClassKey = key; document.getElementById('class-selection-screen').classList.add('hidden'); document.getElementById('name-selection-screen').classList.remove('hidden'); document.getElementById('input-hero-name').focus(); },
    cancelName() { window.audio.playClick(); this.tempClassKey = null; document.getElementById('name-selection-screen').classList.add('hidden'); document.getElementById('class-selection-screen').classList.remove('hidden'); },
    
    confirmName() {
        const input = document.getElementById('input-hero-name').value.trim();
        if (!input) { alert("Por favor, batize seu herói!"); return; }
        window.audio.playClick(); window.audio.startBGM(); window.player.playerName = input;
        const cls = window.classesData[this.tempClassKey]; window.player.classObj = cls;
        window.player.hp = cls.hp; window.player.maxHp = cls.hp; window.player.mp = cls.mp; window.player.maxMp = cls.mp;
        window.player.baseAtk = cls.atk; window.player.baseDef = cls.def; 
        window.player.str = cls.str; window.player.dex = cls.dex; window.player.spd = cls.spd; window.player.cha = cls.cha; window.player.recalculateStats();
        
        document.getElementById('hero-name-display').innerText = window.player.playerName; document.getElementById('hero-icon').innerText = cls.icon; 
        document.getElementById('player-art-icon').innerText = cls.icon; document.getElementById('hero-class-name').innerText = cls.name; document.getElementById('skill-name').innerText = cls.skillName;
        document.getElementById('name-selection-screen').classList.add('hidden'); document.getElementById('main-game-screen').classList.remove('hidden'); document.getElementById('top-menu').classList.remove('hidden');
        this.state = 'explore'; 
        
        // Inicia a história principal
        window.ui.triggerPureStory(
            "👑 O Sequestro Real",
            `O reino de Aethelgard está em prantos. A Princesa Seraphina, portadora da Luz Ancestral, foi sequestrada na calada da noite pelo pavoroso Deus da Ruína.\n\nSua majestade declarou: "Aquele que a trouxer de volta terá a salvação do reino". ${window.player.playerName}, prepare sua arma. Sua jornada épica começa agora!`,
            "Aceitar a Missão"
        );
        this.saveGame();
    },

    explore() {
        window.audio.playClick();
        let b = Math.floor(window.player.lvl / 10) * 10;
        if (b >= 10 && window.player.highestBossDefeated < b && window.bossesDB[b]) {
            window.ui.log(`🌩️ CHEFÃO / BOSS DA HISTÓRIA!`, "dmg-taken"); setTimeout(() => { window.combat.start(window.bossesDB[b], true, b); }, 1500); return;
        }

        const r = Math.random();
        
        if (r < 0.40) {
            window.combat.start(window.bestiary[Math.floor(Math.random()*window.bestiary.length)], false);
        } 
        else if (r < 0.60) {
            window.ui.triggerEvent();
        } 
        else if (r < 0.85) { 
            const g = Math.floor(Math.random() * 20) + 5 + Math.floor(window.player.lvl * 2); window.player.gold += g;
            window.ui.log(`🌲 Achou/Found ${g}💰 num canto escuro.`, "loot"); window.ui.update(); this.saveGame();
        } 
        else { 
            const iRoll = Math.random(); let dropTemplate;
            if(iRoll < 0.33) dropTemplate = window.lootTables.weapons[Math.floor(Math.random() * window.lootTables.weapons.length)];
            else if(iRoll < 0.66) dropTemplate = window.lootTables.armors[Math.floor(Math.random() * window.lootTables.armors.length)];
            else dropTemplate = window.lootTables.offhands[Math.floor(Math.random() * window.lootTables.offhands.length)];
            
            let scaledStat = dropTemplate.stat + Math.floor(window.player.lvl / 2);
            let drop = { ...dropTemplate, stat: scaledStat };
            window.player.inventory.push(drop); window.ui.log(`🎁 Pilhagem! Item: <b>${drop.name} (+${drop.stat})</b>!`, "skill");
            window.ui.update(); this.saveGame();
        }
    },

    rest() {
        window.audio.playClick(); let innPrice = 10;
        if (window.player.gold >= innPrice) {
            window.player.gold -= innPrice; window.player.hp = window.player.maxHp; window.player.mp = window.player.maxMp;
            window.ui.log(`🛌 Descansou e ouviu fofocas sobre o avanço do Deus da Ruína (${innPrice}💰).`, "loot"); window.ui.update(); this.saveGame();
        } else { window.ui.log("❌ Ouro insuficiente."); }
    }
};

window.combat = {
    enemy: null, isBossFight: 0, 
    start(e, isBoss = false, bLvl = 0) {
        window.game.state = 'combat'; this.isBossFight = isBoss ? bLvl : 0;
        const scale = 1 + ((window.player.lvl - 1) * 0.25);
        this.enemy = { name: e.name, hp: Math.floor(e.baseHp * scale), maxHp: Math.floor(e.baseHp * scale), atk: Math.floor(e.baseAtk * scale), xp: Math.floor(e.baseXp * scale), gold: Math.floor(e.baseGold * scale), icon: e.icon, lvl: isBoss ? bLvl : window.player.lvl };
        
        document.getElementById('battle-arena').style.boxShadow = isBoss ? "inset 0 0 30px #b71c1c, 0 5px 15px rgba(0,0,0,0.8)" : "inset 0 0 30px #000, 0 5px 15px rgba(0,0,0,0.8)";
        document.getElementById('battle-arena').style.borderColor = isBoss ? "#ff5252" : "#444";
        window.ui.log(`⚠️ <b>${this.enemy.name} (Nvl ${this.enemy.lvl})</b> ataca!`, "dmg-taken");
        window.ui.toggleMode(true); window.ui.update();
    },
    attack() {
        if (!this.enemy || this.enemy.hp <= 0) return;
        window.audio.playAttack(); window.ui.animate('player-portrait', 'anim-attack');
        const damage = window.player.atk + Math.floor(Math.random() * 8);
        this.processPlayerDamage(damage, `⚔️ <b>${damage}</b> dmg!`);
    },
    useSkill() {
        if (!this.enemy || this.enemy.hp <= 0) return;
        if (window.player.mp < window.player.classObj.skillCost) return window.ui.log("❌ Sem Mana / OOM", "dmg-taken");
        window.player.mp -= window.player.classObj.skillCost; window.ui.update();
        window.audio.playAttack(); window.ui.animate('player-portrait', 'anim-attack');
        const damage = Math.floor((window.player.atk * window.player.classObj.skillMult)) + Math.floor(Math.random() * 15);
        this.processPlayerDamage(damage, `✨ <b>${window.player.classObj.skillName}</b>: <b>${damage}</b> dmg!`, "skill");
    },
    processPlayerDamage(damage, logMsg) {
        this.enemy.hp -= damage; window.ui.log(logMsg, "dmg-dealt"); window.ui.animate('enemy-portrait', 'anim-shake'); window.ui.update();
        document.getElementById('combat-actions').style.pointerEvents = 'none';
        if (this.enemy.hp <= 0) setTimeout(() => this.win(), 800); else setTimeout(() => this.enemyTurn(), 1000);
    },
    enemyTurn() {
        if (!this.enemy || window.player.hp <= 0) return;
        window.ui.animate('enemy-portrait', 'anim-attack');
        let dodgeChance = Math.min(0.30, (window.player.dex + window.player.spd) / 1000);
        if(Math.random() < dodgeChance) {
            window.ui.log(`💨 Esquivou! / Dodged!`, "skill"); document.getElementById('combat-actions').style.pointerEvents = 'auto'; return;
        }
        const finalDamage = Math.max(1, (this.enemy.atk + Math.floor(Math.random() * 6)) - window.player.def); 
        window.player.hp -= finalDamage; window.audio.playGrunt();
        window.ui.log(`🩸 Inimigo ataca: <b>${finalDamage}</b> (Aparou/Def ${window.player.def}🛡️).`, "dmg-taken");
        window.ui.animate('player-portrait', 'anim-shake'); window.ui.update(); document.getElementById('combat-actions').style.pointerEvents = 'auto';
        if (window.player.hp <= 0) this.lose();
    },
    flee() {
        window.audio.playClick();
        if (this.isBossFight) return window.ui.log("❌ Não se pode fugir do destino!", "dmg-taken");
        let fleeChance = 0.4 + (window.player.spd / 200); 
        if (Math.random() < fleeChance) { window.ui.log("🏃 Escapou para as sombras!"); this.end(); } 
        else { window.ui.log("🏃 Tropeçou e falhou!", "dmg-taken"); document.getElementById('combat-actions').style.pointerEvents = 'none'; setTimeout(() => this.enemyTurn(), 800); }
    },
    win() {
        window.ui.log(`🏆 Venceu! +${this.enemy.gold}💰, +${this.enemy.xp} EXP.`, "loot");
        window.player.gold += this.enemy.gold; window.player.gainXp(this.enemy.xp); 
        if (this.isBossFight) {
            window.player.highestBossDefeated = this.isBossFight;
            
            // Progressão da História pelos Chefes
            if (this.isBossFight === 10) {
                window.ui.triggerPureStory("👑 Pista Real", "Ao revistar o trono manchado de sangue do Rei Goblin, você encontra um pedaço do vestido da Princesa Seraphina. Ela passou por aqui, levada em direção às montanhas escuras...", "Continuar a Busca");
            } else if (this.isBossFight === 50) {
                window.ui.triggerPureStory("🐉 O Portal Sombrio", "Com seu último fôlego, o Dragão Negro rosnou: 'Você é tolo... o Deus a levou para o Abismo...'. O chão treme e os portões do submundo se abrem diante de você.", "Descer ao Abismo");
            } else if (this.isBossFight === 150) {
                window.ui.triggerPureStory("🎉 O Triunfo da Luz", `A divindade sombria despenca diante do seu poder avassalador. Nos fundos do templo colossal, presa por correntes obscuras que agora se quebram, está a Princesa Seraphina.\n\nEla abre os olhos e sorri para você. "Você me salvou, ${window.player.playerName}. E salvou Aethelgard."\n\nPARABÉNS! Você zerou o jogo!`, "Renacer e Jogar Novamente", () => {
                    localStorage.removeItem('aethelgard_save'); location.reload();
                });
                return;
            } else {
                window.ui.log(`👑 <b>CHEFÃO DERROTADO! O caminho se abre.</b>`, "skill");
            }
        }
        window.game.saveGame(); this.end();
    },
    lose() {
        window.ui.log(`💀 <b>MORTO / DEAD. A princesa está perdida.</b>`, "dmg-taken"); document.getElementById('combat-actions').style.display = 'none';
        localStorage.removeItem('aethelgard_save'); setTimeout(() => location.reload(), 4000);
    },
    end() { 
        window.game.state = 'explore'; this.enemy = null; this.isBossFight = 0; 
        document.getElementById('combat-actions').style.pointerEvents = 'auto'; document.getElementById('battle-arena').style.borderColor = "#444"; 
        document.getElementById('battle-arena').style.boxShadow = "inset 0 0 30px #000, 0 5px 15px rgba(0,0,0,0.8)";
        window.ui.toggleMode(false); window.ui.update(); 
    }
};

window.ui = {
    log(m, cls = "") { const c = document.getElementById('log-window'); const u = document.getElementById('game-log'); const l = document.createElement('li'); l.innerHTML = `> ${m}`; if(cls) l.className = cls; u.appendChild(l); setTimeout(() => { c.scrollTop = c.scrollHeight; }, 10); },
    update() {
        if(!window.player.classObj) return; 
        document.getElementById('hp').innerText = Math.max(0, window.player.hp); document.getElementById('max-hp').innerText = window.player.maxHp;
        document.getElementById('mp').innerText = window.player.mp; document.getElementById('max-mp').innerText = window.player.maxMp;
        document.getElementById('atk-val').innerText = window.player.atk; document.getElementById('def-val').innerText = window.player.def;
        document.getElementById('str-val').innerText = window.player.str; document.getElementById('spd-val').innerText = window.player.spd;
        document.getElementById('dex-val').innerText = window.player.dex; document.getElementById('cha-val').innerText = window.player.cha;
        document.getElementById('lvl').innerText = window.player.lvl; document.getElementById('gold').innerText = window.player.gold; document.getElementById('potions').innerText = window.player.potions;
        document.getElementById('hp-bar').style.width = `${Math.max(0, (window.player.hp / window.player.maxHp) * 100)}%`; document.getElementById('mp-bar').style.width = `${Math.max(0, (window.player.mp / window.player.maxMp) * 100)}%`; document.getElementById('xp-bar').style.width = `${window.player.lvl >= 150 ? 100 : Math.min(100, (window.player.xp / window.player.xpToNext) * 100)}%`;
        if (window.combat.enemy) { document.getElementById('enemy-name-display').innerText = window.combat.enemy.name; document.getElementById('enemy-art-icon').innerText = window.combat.enemy.icon; document.getElementById('enemy-hp-bar').style.width = `${Math.max(0, (window.combat.enemy.hp / window.combat.enemy.maxHp) * 100)}%`; }
    },
    updateInventoryModal() {
        const d = i18n[window.lang]; let eqHTML = "";
        if (window.player.equipped.weapon) eqHTML += `<li class="inv-item"><span>🗡️ ${window.player.equipped.weapon.name} <span style="color:#ffb300;">(+${window.player.equipped.weapon.stat} Atk)</span></span> <button class="inv-btn" onclick="window.player.unequip('weapon')">${d.unequip}</button></li>`; else eqHTML += `<li class="inv-item" style="color:#777;">🗡️ ${d.empty}</li>`;
        if (window.player.equipped.offhand) eqHTML += `<li class="inv-item"><span>🎒 ${window.player.equipped.offhand.name} <span style="color:${window.player.equipped.offhand.adds==='atk'?'#ffb300':'#90caf9'};">(+${window.player.equipped.offhand.stat} ${window.player.equipped.offhand.adds==='atk'?'Atk':'Def'})</span></span> <button class="inv-btn" onclick="window.player.unequip('offhand')">${d.unequip}</button></li>`; else eqHTML += `<li class="inv-item" style="color:#777;">🎒 ${d.empty}</li>`;
        if (window.player.equipped.armor) eqHTML += `<li class="inv-item"><span>🛡️ ${window.player.equipped.armor.name} <span style="color:#90caf9;">(+${window.player.equipped.armor.stat} Def)</span></span> <button class="inv-btn" onclick="window.player.unequip('armor')">${d.unequip}</button></li>`; else eqHTML += `<li class="inv-item" style="color:#777;">🛡️ ${d.empty}</li>`;
        document.getElementById('inv-equipped').innerHTML = eqHTML;
        let bagHTML = `<li class="inv-item"><span>🧪 Poção (x${window.player.potions})</span> <button class="inv-btn" onclick="window.player.usePotion()">${d.use}</button></li>`;
        window.player.inventory.forEach((item, index) => {
            let icon = item.type === 'weapon' ? '🗡️' : (item.type === 'armor' ? '🛡️' : '🎒');
            let statType = item.type === 'weapon' ? 'Atk' : (item.type === 'armor' ? 'Def' : (item.adds === 'atk' ? 'Atk' : 'Def'));
            bagHTML += `<li class="inv-item"><span>${icon} ${item.name} <span style="color:${statType==='Atk'?'#ffb300':'#90caf9'};">(+${item.stat} ${statType})</span></span> <div class="inv-btn-group"><button class="inv-btn btn-sell" onclick="window.player.sell(${index})">${d.sell}</button><button class="inv-btn" onclick="window.player.equip(${index})">${d.equip}</button></div></li>`;
        });
        document.getElementById('inv-bag').innerHTML = bagHTML;
    },
    
    // Mostra as interações de escolha com NPCs
    triggerEvent() {
        window.audio.playClick();
        const ev = window.events[Math.floor(Math.random() * window.events.length)];
        document.getElementById('event-title').innerText = ev.title;
        document.getElementById('event-desc').innerText = ev.desc;
        
        const choicesContainer = document.getElementById('event-choices');
        choicesContainer.innerHTML = '';
        
        ev.choices.forEach(choice => {
            let btn = document.createElement('button');
            btn.className = 'btn-medieval';
            btn.innerText = choice.text;
            btn.onclick = () => {
                window.audio.playClick();
                document.getElementById('event-modal').classList.add('hidden');
                choice.action();
                window.ui.update(); window.game.saveGame();
            };
            choicesContainer.appendChild(btn);
        });
        document.getElementById('event-modal').classList.remove('hidden');
    },

    // Mostra apenas um popup com a evolução da história (usado em chefes)
    triggerPureStory(title, desc, btnText, callback = null) {
        document.getElementById('event-title').innerText = title;
        document.getElementById('event-desc').innerText = desc;
        
        const choicesContainer = document.getElementById('event-choices');
        choicesContainer.innerHTML = '';
        
        let btn = document.createElement('button');
        btn.className = 'btn-medieval';
        btn.innerText = btnText;
        btn.onclick = () => {
            window.audio.playClick();
            document.getElementById('event-modal').classList.add('hidden');
            if(callback) callback();
        };
        choicesContainer.appendChild(btn);
        document.getElementById('event-modal').classList.remove('hidden');
    },

    openInventory() { window.audio.playClick(); document.getElementById('inventory-modal').classList.remove('hidden'); this.updateInventoryModal(); },
    closeInventory() { window.audio.playClick(); document.getElementById('inventory-modal').classList.add('hidden'); },
    openSettings() { window.audio.playClick(); document.getElementById('settings-modal').classList.remove('hidden'); },
    closeSettings() { window.audio.playClick(); document.getElementById('settings-modal').classList.add('hidden'); },
    toggleMode(b) { document.getElementById('exploration-actions').classList.toggle('hidden', b); document.getElementById('combat-actions').classList.toggle('hidden', !b); document.getElementById('battle-arena').classList.toggle('hidden', !b); },
    animate(id, cls) { const el = document.getElementById(id); if(!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 350); }
};

window.onload = () => { 
    window.sys.setLang('pt'); 
    if(window.game.loadGame()) { document.getElementById('top-menu').classList.remove('hidden'); } 
    else { document.getElementById('class-selection-screen').classList.remove('hidden'); }
};
