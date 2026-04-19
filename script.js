// ==========================================
// ESTADO DO JOGO E BANCO DE DADOS
// ==========================================
let state = {
    hero: {
        name: "Herói", class: "", level: 1, xp: 0, nextXp: 50,
        hp: 100, maxHp: 100, mp: 50, maxMp: 50,
        atk: 10, def: 10, str: 10, dex: 10, spd: 10, cha: 10,
        gold: 0, potions: 3
    },
    enemy: null,
    inCombat: false,
    gameBeaten: false
};

const classes = {
    cavaleiro: { name: "Cavaleiro", hp: 150, mp: 30, atk: 12, def: 15, str: 14, dex: 8, spd: 8, cha: 10, icon: "🛡️" },
    mago: { name: "Mago", hp: 80, mp: 100, atk: 18, def: 5, str: 4, dex: 10, spd: 10, cha: 12, icon: "🧙‍♂️" },
    arqueiro: { name: "Arqueiro", hp: 100, mp: 50, atk: 15, def: 8, str: 8, dex: 15, spd: 14, cha: 10, icon: "🏹" },
    anao: { name: "Anão", hp: 180, mp: 20, atk: 14, def: 18, str: 16, dex: 6, spd: 5, cha: 8, icon: "🪓" }
};

const monsterNames = ["Goblin Saqueador", "Lobo Atroz", "Esqueleto Errante", "Orc Brutal", "Aparição Sombria", "Golem de Pedra"];

// ==========================================
// FUNÇÕES DE INTERFACE (UI)
// ==========================================
window.ui = {
    updateHUD: function() {
        const h = state.hero;
        document.getElementById('lvl').innerText = h.level;
        document.getElementById('hp').innerText = Math.max(0, h.hp);
        document.getElementById('max-hp').innerText = h.maxHp;
        document.getElementById('mp').innerText = Math.max(0, h.mp);
        document.getElementById('max-mp').innerText = h.maxMp;
        document.getElementById('atk-val').innerText = h.atk;
        document.getElementById('def-val').innerText = h.def;
        document.getElementById('str-val').innerText = h.str;
        document.getElementById('spd-val').innerText = h.spd;
        document.getElementById('dex-val').innerText = h.dex;
        document.getElementById('cha-val').innerText = h.cha;
        document.getElementById('gold').innerText = h.gold;
        document.getElementById('potions').innerText = h.potions;

        document.getElementById('hp-bar').style.width = `${(h.hp / h.maxHp) * 100}%`;
        document.getElementById('mp-bar').style.width = `${(h.mp / h.maxMp) * 100}%`;
        document.getElementById('xp-bar').style.width = `${(h.xp / h.nextXp) * 100}%`;
    },
    log: function(msg, type = 'sys') {
        const log = document.getElementById('game-log');
        const li = document.createElement('li');
        li.className = type;
        li.innerHTML = msg;
        log.prepend(li);
        if (log.children.length > 20) log.removeChild(log.lastChild);
    },
    openInventory: () => document.getElementById('inventory-modal').classList.remove('hidden'),
    closeInventory: () => document.getElementById('inventory-modal').classList.add('hidden'),
    openSettings: () => document.getElementById('settings-modal').classList.remove('hidden'),
    closeSettings: () => document.getElementById('settings-modal').classList.add('hidden'),
    
    showStoryEvent: function(title, text, options) {
        document.getElementById('story-title').innerText = title;
        document.getElementById('story-text').innerHTML = text;
        const optsContainer = document.getElementById('story-options');
        optsContainer.innerHTML = '';
        
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn-medieval';
            btn.innerText = opt.label;
            btn.onclick = () => {
                document.getElementById('story-modal').classList.add('hidden');
                if(opt.action) opt.action();
            };
            optsContainer.appendChild(btn);
        });
        document.getElementById('story-modal').classList.remove('hidden');
    }
};

// ==========================================
// CONTROLES DO JOGO
// ==========================================
window.game = {
    chooseClass: function(c) {
        state.hero.class = c;
        const cd = classes[c];
        Object.assign(state.hero, cd);
        state.hero.maxHp = cd.hp; state.hero.maxMp = cd.mp;
        document.getElementById('hero-class-name').innerText = cd.name;
        document.getElementById('hero-icon').innerText = cd.icon;
        document.getElementById('player-art-icon').innerText = cd.icon;
        document.getElementById('class-selection-screen').classList.add('hidden');
        document.getElementById('name-selection-screen').classList.remove('hidden');
    },
    confirmName: function() {
        const nameInput = document.getElementById('input-hero-name').value.trim();
        if(nameInput) state.hero.name = nameInput;
        document.getElementById('hero-name-display').innerText = state.hero.name;
        document.getElementById('name-selection-screen').classList.add('hidden');
        document.getElementById('main-game-screen').classList.remove('hidden');
        document.getElementById('top-menu').classList.remove('hidden');
        window.ui.updateHUD();

        // INTRODUÇÃO DA HISTÓRIA
        window.ui.showStoryEvent("O Rapto da Princesa", 
            `Salve, bravo ${state.hero.name}! Aethelgard está em ruínas. O temível <b>Lorde das Sombras</b> sequestrou a Princesa Elara e a trancou no ápice da Torre do Desespero.<br><br>Sua missão é treinar, sobreviver aos perigos do reino e alcançar o <b>Nível 100</b> para enfrentar o lorde e resgatá-la!`, 
            [{ label: "⚔️ Aceitar o Destino", action: () => window.ui.log("A jornada épica começa...", "sys") }]
        );
    },
    cancelName: function() {
        document.getElementById('name-selection-screen').classList.add('hidden');
        document.getElementById('class-selection-screen').classList.remove('hidden');
    },
    explore: function() {
        if(state.inCombat) return;
        
        if (state.hero.level >= 100 && !state.gameBeaten) {
            triggerFinalBoss();
            return;
        }

        const roll = Math.random();
        if(roll < 0.5) {
            startCombat();
        } else if(roll < 0.8) {
            triggerNPCEvent();
        } else {
            const foundGold = Math.floor(Math.random() * 10) + (state.hero.level * 2);
            state.hero.gold += foundGold;
            window.ui.log(`Você encontrou ${foundGold} moedas num baú esquecido!`, "loot");
            window.ui.updateHUD();
        }
    },
    rest: function() {
        if(state.inCombat) return;
        if(state.hero.gold >= 10) {
            state.hero.gold -= 10;
            state.hero.hp = state.hero.maxHp;
            state.hero.mp = state.hero.maxMp;
            window.ui.log("Você descansou na pousada e recuperou tudo.", "sys");
            window.ui.updateHUD();
        } else {
            window.ui.log("Ouro insuficiente para descansar (Custa 10).", "sys");
        }
    },
    resetGame: function() {
        location.reload();
    }
};

// ==========================================
// SISTEMA DE EVENTOS / NPCs
// ==========================================
function triggerNPCEvent() {
    const events = [
        {
            title: "O Bêbado", text: "Um homem cambaleia até você na estrada. 'Hic! Tem uma moedinha para um pobre coitado? Eu te conto um segredo!'",
            options: [
                { label: "💰 Dar 5 Ouros", action: () => {
                    if(state.hero.gold >= 5) {
                        state.hero.gold -= 5;
                        if(Math.random() > 0.5) {
                            state.hero.potions++;
                            window.ui.log("O bêbado te deu uma Poção estranha!", "loot");
                        } else {
                            window.ui.log("O bêbado murmurou algo inútil e fugiu.", "sys");
                        }
                        window.ui.updateHUD();
                    } else window.ui.log("Você não tem ouro suficiente.", "sys");
                }},
                { label: "Ignorar", action: () => window.ui.log("Você seguiu viagem.", "sys") }
            ]
        },
        {
            title: "A Fada da Floresta", text: "Pequenas luzes dançam ao seu redor. Uma fada gentil pousa no seu ombro. 'Você parece cansado, herói.'",
            options: [
                { label: "✨ Aceitar Bênção", action: () => {
                    state.hero.hp = state.hero.maxHp;
                    window.ui.log("A fada restaurou toda sua vida!", "skill");
                    window.ui.updateHUD();
                }}
            ]
        },
        {
            title: "O Ladrão Sorrateiro", text: "Um vulto encapuzado bloqueia o caminho com uma adaga. 'A bolsa ou a vida!'",
            options: [
                { label: "⚔️ Lutar", action: () => startCombat("Ladrão da Estrada") },
                { label: "🏃 Fugir", action: () => {
                    const perda = Math.floor(state.hero.gold * 0.2);
                    state.hero.gold -= perda;
                    window.ui.log(`Você fugiu, mas o ladrão roubou ${perda} moedas!`, "dmg-taken");
                    window.ui.updateHUD();
                }}
            ]
        },
        {
            title: "Elfo Ferido", text: "Você encontra um guerreiro elfo sangrando encostado numa árvore. 'Por favor... uma poção...'",
            options: [
                { label: "🧪 Dar Poção", action: () => {
                    if(state.hero.potions > 0) {
                        state.hero.potions--;
                        const reward = 30 + (state.hero.level * 5);
                        state.hero.gold += reward;
                        window.ui.log(`O Elfo agradeceu e lhe deu ${reward} moedas de ouro!`, "loot");
                        window.ui.updateHUD();
                    } else window.ui.log("Você não tem poções para ajudá-lo.", "sys");
                }},
                { label: "Deixá-lo", action: () => window.ui.log("Você virou as costas para o elfo.", "sys") }
            ]
        }
    ];
    const ev = events[Math.floor(Math.random() * events.length)];
    window.ui.showStoryEvent(ev.title, ev.text, ev.options);
}

// ==========================================
// SISTEMA DE COMBATE
// ==========================================
function startCombat(specificEnemy = null) {
    state.inCombat = true;
    const isBoss = specificEnemy === "Lorde das Sombras";
    
    // Escalonamento do inimigo baseado no nível do jogador
    const multiplier = 1 + (state.hero.level * 0.25);
    state.enemy = {
        name: specificEnemy || monsterNames[Math.floor(Math.random() * monsterNames.length)] + ` Nvl ${state.hero.level}`,
        hp: Math.floor((isBoss ? 500 : 40) * multiplier),
        maxHp: Math.floor((isBoss ? 500 : 40) * multiplier),
        atk: Math.floor((isBoss ? 25 : 8) * multiplier),
        def: Math.floor((isBoss ? 20 : 5) * multiplier),
        icon: isBoss ? "🐉" : "👺"
    };

    document.getElementById('enemy-name-display').innerText = state.enemy.name;
    document.getElementById('enemy-art-icon').innerText = state.enemy.icon;
    document.getElementById('enemy-hp-bar').style.width = "100%";
    
    document.getElementById('exploration-actions').classList.add('hidden');
    document.getElementById('combat-actions').classList.remove('hidden');
    document.getElementById('battle-arena').classList.remove('hidden');

    window.ui.log(`Um ${state.enemy.name} apareceu!`, "sys");
}

function triggerFinalBoss() {
    window.ui.showStoryEvent("O Ápice da Torre", 
        `Os portões de ferro se abrem. O chão treme. O <b>Lorde das Sombras</b> se ergue, com a Princesa Elara presa num cristal negro atrás dele.<br><br>"Você chegou longe, mortal. Mas sua jornada termina aqui!"`, 
        [{ label: "⚔️ LUTAR PELA PRINCESA!", action: () => startCombat("Lorde das Sombras") }]
    );
}

window.combat = {
    attack: function() {
        if(!state.inCombat) return;
        document.getElementById('player-portrait').classList.add('anim-attack');
        setTimeout(() => document.getElementById('player-portrait').classList.remove('anim-attack'), 300);

        let dmg = Math.max(1, state.hero.atk - (state.enemy.def / 2) + Math.floor(Math.random() * 5));
        state.enemy.hp -= dmg;
        window.ui.log(`Você atacou causando ${dmg} de dano!`, "dmg-dealt");
        
        checkCombatStatus();
    },
    useSkill: function() {
        if(!state.inCombat || state.hero.mp < 15) {
            window.ui.log("Mana insuficiente! (Custa 15)", "sys");
            return;
        }
        state.hero.mp -= 15;
        let dmg = Math.max(5, (state.hero.atk * 1.5) - (state.enemy.def / 3));
        state.enemy.hp -= dmg;
        window.ui.log(`Você usou Poder Especial causando ${dmg} de dano mágico!`, "skill");
        window.ui.updateHUD();
        checkCombatStatus();
    },
    flee: function() {
        if(state.enemy.name === "Lorde das Sombras") {
            window.ui.log("Você não pode fugir desta batalha final!", "dmg-taken");
            enemyTurn();
            return;
        }
        if(Math.random() > 0.4) {
            window.ui.log("Você fugiu com sucesso!", "sys");
            endCombat();
        } else {
            window.ui.log("Falhou ao fugir!", "sys");
            enemyTurn();
        }
    }
};

window.player = {
    buyPotion: function() {
        if(state.hero.gold >= 20) {
            state.hero.gold -= 20;
            state.hero.potions++;
            window.ui.log("Poção comprada!", "loot");
            window.ui.updateHUD();
        } else window.ui.log("Ouro insuficiente para poção.", "sys");
    },
    usePotion: function() {
        if(state.hero.potions > 0) {
            state.hero.potions--;
            let heal = Math.floor(state.hero.maxHp * 0.4);
            state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + heal);
            window.ui.log(`Você usou uma poção e curou ${heal} de vida.`, "skill");
            window.ui.updateHUD();
            if(state.inCombat) enemyTurn();
        } else window.ui.log("Você não tem poções!", "sys");
    }
};

function enemyTurn() {
    if(state.enemy.hp <= 0) return;
    
    document.getElementById('enemy-portrait').classList.add('anim-attack');
    setTimeout(() => document.getElementById('enemy-portrait').classList.remove('anim-attack'), 300);

    let dmg = Math.max(1, state.enemy.atk - (state.hero.def / 2) + Math.floor(Math.random() * 3));
    state.hero.hp -= dmg;
    
    document.querySelector('.hp-container').classList.add('anim-shake');
    setTimeout(() => document.querySelector('.hp-container').classList.remove('anim-shake'), 300);

    window.ui.log(`${state.enemy.name} causou ${Math.floor(dmg)} de dano!`, "dmg-taken");
    window.ui.updateHUD();

    if(state.hero.hp <= 0) {
        window.ui.log("VOCÊ MORREU!", "dmg-taken");
        state.inCombat = false;
        setTimeout(() => {
            alert("Sua jornada terminou. O reino caiu nas sombras.");
            location.reload();
        }, 1000);
    }
}

function checkCombatStatus() {
    document.getElementById('enemy-hp-bar').style.width = `${Math.max(0, (state.enemy.hp / state.enemy.maxHp) * 100)}%`;
    
    if(state.enemy.hp <= 0) {
        if(state.enemy.name === "Lorde das Sombras") {
            state.gameBeaten = true;
            endCombat();
            window.ui.showStoryEvent("A Lenda Cumprida", 
                `O Lorde das Sombras cai perante seu poder. O cristal se parte e a <b>Princesa Elara</b> corre para seus braços.<br><br>"Obrigada, herói. Você salvou Aethelgard."<br><br><b>PARABÉNS! VOCÊ ZEROU O JOGO!</b>`, 
                [{ label: "Continuar Explorando", action: () => {} }]
            );
            return;
        }

        let xpGained = 15 + (state.hero.level * 5);
        let goldGained = 5 + Math.floor(Math.random() * 10) + state.hero.level;
        state.hero.xp += xpGained;
        state.hero.gold += goldGained;
        window.ui.log(`Venceu! Ganhou ${xpGained} XP e ${goldGained} Ouro.`, "loot");
        
        checkLevelUp();
        endCombat();
    } else {
        setTimeout(enemyTurn, 800);
    }
}

function checkLevelUp() {
    if(state.hero.xp >= state.hero.nextXp && state.hero.level < 100) {
        state.hero.level++;
        state.hero.xp = 0;
        state.hero.nextXp = Math.floor(state.hero.nextXp * 1.5);
        
        // Aumenta atributos
        state.hero.maxHp += 15; state.hero.hp = state.hero.maxHp;
        state.hero.maxMp += 5; state.hero.mp = state.hero.maxMp;
        state.hero.atk += 3; state.hero.def += 2;
        
        window.ui.log(`🌟 NÍVEL ${state.hero.level} ALCANÇADO! Atributos aumentados!`, "skill");
        window.ui.updateHUD();
    }
}

function endCombat() {
    state.inCombat = false;
    document.getElementById('battle-arena').classList.add('hidden');
    document.getElementById('combat-actions').classList.add('hidden');
    document.getElementById('exploration-actions').classList.remove('hidden');
    window.ui.updateHUD();
}

window.sys = {
    setLang: function(lang) { alert("Idioma alterado para " + lang.toUpperCase() + " (Em breve na v2)"); },
    exitSave: function() { 
        localStorage.setItem('aethelgard_save', JSON.stringify(state));
        alert("Jogo salvo com sucesso!"); 
    }
};

// Tenta carregar o save ao iniciar
window.onload = function() {
    const saved = localStorage.getItem('aethelgard_save');
    if(saved) {
        if(confirm("Deseja carregar seu jogo salvo?")) {
            state = JSON.parse(saved);
            document.getElementById('class-selection-screen').classList.add('hidden');
            document.getElementById('name-selection-screen').classList.add('hidden');
            document.getElementById('main-game-screen').classList.remove('hidden');
            document.getElementById('top-menu').classList.remove('hidden');
            document.getElementById('hero-name-display').innerText = state.hero.name;
            document.getElementById('player-art-icon').innerText = classes[state.hero.class]?.icon || "🤺";
            window.ui.updateHUD();
        }
    }
};
