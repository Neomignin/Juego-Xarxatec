const player = {
    name: "Héroe",
    level: 1,
    hp: 800,
    maxHp: 800,
    mp: 60,
    maxMp: 60,
    attack: 20,
    defense: 40,
    skills: [
        { name: "Multislash (Hace daño a todos los enemigos)", damage: 0.9, target: "all", manaCost: 20 },
        { name: "Estocada múltiple (Hace daño de 3 a 5 veces a enemigos al azar)", damage: 0.5, minHits: 3, maxHits: 5, manaCost: 20 },
        { name: "Estocada (Hace mucho daño al enemigo)", damage: 2, manaCost: 15 },
        { name: "Cura (Restaura vida)", healPercent: 0.2, manaCost: 25 }
    ],
    items: ["Poción"],
    inventory: [],
    equipment: {
        Arma: null,
        Armadura: null,
        Accesorio: null
    },
    experience: 0,
    experienceToNextLevel: 80,
    isDefending: false,
    gold: 0,
    questProgress: 0
};

let enemies = [];
let monsterLevel = 1;
let targetedEnemyIndex = 0;
let isBossBattle = false;

const baseMonsters = [
    {
        name: "Dragón",
        hp: 150,
        maxHp: 150,
        attack: 75,
        defense: 10,
        experienceReward: 70,
        dropChance: 0.7
    },
    {
        name: "Sylph",
        hp: 120,
        maxHp: 120,
        attack: 50,
        defense: 6,
        experienceReward: 25,
        dropChance: 0.5
    },
    {
        name: "Golem",
        hp: 180,
        maxHp: 180,
        attack: 60,
        defense: 20,
        experienceReward: 50,
        dropChance: 0.6
    },
    {
        name: "Limo",
        hp: 60,
        maxHp: 60,
        attack: 40,
        defense: 3,
        experienceReward: 15,
        dropChance: 0.2
    },
    {
        name: "Demonio",
        hp: 90,
        maxHp: 90,
        attack: 85,
        defense: 4,
        experienceReward: 60,
        dropChance: 0.8
    },
];

const bosses = [
    {
        name: "Rey Dragón",
        hp: 400,
        maxHp: 400,
        attack: 130,
        defense: 15,
        experienceReward: 250,
        dropChance: 1,
        goldReward: 100
    },
    {
        name: "Archimago Oscuro",
        hp: 350,
        maxHp: 350,
        attack: 140,
        defense: 12,
        experienceReward: 300,
        dropChance: 1,
        goldReward: 150
    }
];

const equipment = [
    { name: "Espada de hierro", type: "weapon", attackBonus: 2, tier: 1 },
    { name: "Espada de acero", type: "weapon", attackBonus: 4, tier: 2 },
    { name: "Espada de plata", type: "weapon", attackBonus: 6, defenseBonus: 2, tier: 3 },
    { name: "Espada de oro", type: "weapon", attackBonus: 8, defenseBonus: 4, tier: 4 },
    { name: "Armadura de hierro", type: "armor", defenseBonus: 2, tier: 1 },
    { name: "Armadura de acero", type: "armor", defenseBonus: 4, tier: 2 },
    { name: "Armadura de plata", type: "armor", defenseBonus: 6, mpBonus: 20, tier: 3 },
    { name: "Armadura de oro", type: "armor", defenseBonus: 8, mpBonus: 40, tier: 4 },
    { name: "Amuleto mágico roto", type: "accessory", mpBonus: 20, tier: 1 },
    { name: "Amuleto mágico inferior", type: "accessory", mpBonus: 40, tier: 2 },
    { name: "Amuleto mágico normal", type: "accessory", mpBonus: 60, defenseBonus: 2, tier: 3 },
    { name: "Amuleto mágico superior", type: "accessory", mpBonus: 80, defenseBonus: 4, attackBonus: 4, tier: 4 }
];

const shopItems = [
    { name: "Poción", cost: 20, effect: () => { player.hp = Math.min(player.hp + 300, player.maxHp); } },
    { name: "Elixir", cost: 50, effect: () => { player.mp = Math.min(player.mp + 20, player.maxMp); } },
    { name: "Bomba", cost: 30, effect: () => { enemies.forEach(enemy => enemy.hp -= 20); } }
];

const quests = [
    { description: "Derrota 5 enemigos", reward: 100, goalProgress: 0, goalTarget: 5 },
    { description: "Vence a un jefe", reward: 200, goalProgress: 0, goalTarget: 1 },
    { description: "Alcanza el nivel 5", reward: 300, goalProgress: 0, goalTarget: 5 }
];

function spawnEnemies() {
    if (monsterLevel % 5 === 0 && !isBossBattle) {
        spawnBoss();
    } else {
        const enemyCount = Math.floor(Math.random() * 2) + 1;
        enemies = [];
        for (let i = 0; i < enemyCount; i++) {
            const randomIndex = Math.floor(Math.random() * baseMonsters.length);
            const enemy = {...baseMonsters[randomIndex]};
            enemy.hp = Math.floor(enemy.hp * (1 + 0.1 * monsterLevel));
            enemy.maxHp = enemy.hp;
            enemy.attack = Math.floor(enemy.attack * (1 + 0.05 * monsterLevel));
            enemy.defense = Math.floor(enemy.defense * (1 + 0.05 * monsterLevel));
            enemy.experienceReward = Math.floor(enemy.experienceReward * (1 + 0.1 * monsterLevel));
            enemy.goldReward = Math.floor(Math.random() * 10) + 5;
            enemies.push(enemy);
        }
    }
    targetedEnemyIndex = 0;
    player.isDefending = false;
    log(`¡Ha(n) aparecido ${enemies.length} enemigo(s)! ¡Prepárate para pelear!`);
    updateStats();
}

function spawnBoss() {
    isBossBattle = true;
    const bossIndex = Math.floor(Math.random() * bosses.length);
    const boss = {...bosses[bossIndex]};
    boss.hp = Math.floor(boss.hp * (1 + 0.1 * monsterLevel));
    boss.maxHp = boss.hp;
    boss.attack = Math.floor(boss.attack * (1 + 0.05 * monsterLevel));
    boss.defense = Math.floor(boss.defense * (1 + 0.05 * monsterLevel));
    boss.experienceReward = Math.floor(boss.experienceReward * (1 + 0.1 * monsterLevel));
    enemies = [boss];
    log(`¡Ha aparecido un jefe: ${boss.name}! ¡Prepárate para una batalla difícil!`);
    updateStats();
}

function targetEnemy(index) {
    if (enemies[index].hp > 0) {
        targetedEnemyIndex = index;
        updateStats();
    }
}

function log(message) {
    const battleLog = document.getElementById('battle-log');
    battleLog.innerHTML += `<div>${message}</div>`;
    battleLog.scrollTop = battleLog.scrollHeight;
}

function performAction(action) {
    switch(action) {
        case 'attack':
            const totalAttack = getTotalAttack();
            const targetEnemy = enemies[targetedEnemyIndex];
            const damage = Math.max(totalAttack - targetEnemy.defense, 0);
            targetEnemy.hp = Math.max(targetEnemy.hp - damage, 0);
            log(`¡Has atacado a ${targetEnemy.name}, y le has hecho ${damage} de daño!`);
            enemiesAttack();
            break;
        case 'defend':
            const mpRecovery = 10;
            player.mp = Math.min(player.mp + mpRecovery, getTotalMaxMp());
            log(`Has tomado una postura defensiva y has recuperado ${mpRecovery} PMs.`);
            enemiesAttackWithDefense();
            break;
            case 'skill':
                showSkillOptions();
                break;
        case 'item':
            if (player.items.length > 0) {
                const item = player.items.pop();
                const shopItem = shopItems.find(shopItem => shopItem.name === item);
                if (shopItem) {
                    shopItem.effect();
                    log(`Has usado ${item}.`);
                }
                enemiesAttack();
            } else {
                log("No te quedan objetos.");
            }
            break;
    }

    updateStats();

    if (enemies.every(enemy => enemy.hp <= 0)) {
        defeatEnemies();
    }
}

function showSkillOptions() {
    const skillsHtml = player.skills.map((skill, index) => 
        `<button onclick="useSkill(${index})">${skill.name} (${skill.manaCost} PM)</button>`
    ).join('');
    
    document.getElementById('actions').innerHTML = `
        <div>Elige una habilidad:</div>
        ${skillsHtml}
        <button onclick="resetActions()">Volver</button>
    `;
}

function useSkill(skillIndex) {
    const skill = player.skills[skillIndex];
    if (player.mp >= skill.manaCost) {
        player.mp -= skill.manaCost;
        
        switch(skill.name) {
            case "Multislash (Hace daño a todos los enemigos)":
                const damage = Math.floor(getTotalAttack() * skill.damage);
                enemies.forEach(enemy => {
                    enemy.hp = Math.max(enemy.hp - damage, 0);
                });
                log(`¡Has usado Multislash y has hecho ${damage} de daño a todos los enemigos!`);
                break;
            case "Estocada múltiple (Hace daño de 3 a 5 veces a enemigos al azar)":
                const hits = Math.floor(Math.random() * (skill.maxHits - skill.minHits + 1)) + skill.minHits;
                let totalDamage = 0;
                for (let i = 0; i < hits; i++) {
                    const hitDamage = Math.floor(getTotalAttack() * skill.damage);
                    totalDamage += hitDamage;
                    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
                    randomEnemy.hp = Math.max(randomEnemy.hp - hitDamage, 0);
                }
                log(`¡Has usado Estocada múltiple y has golpeado ${hits} veces, haciendo un total de ${totalDamage} de daño!`);
                break;
            case "Estocada (Hace mucho daño al enemigo)":
                const estocadaDamage = Math.floor(getTotalAttack() * skill.damage);
                const targetEnemy = enemies[targetedEnemyIndex];
                targetEnemy.hp = Math.max(targetEnemy.hp - estocadaDamage, 0);
                log(`¡Has usado Estocada y has hecho ${estocadaDamage} de daño a ${targetEnemy.name}!`);
                break;
            case "Cura (Restaura vida)":
                const healAmount = Math.floor(player.maxHp * skill.healPercent);
                player.hp = Math.min(player.hp + healAmount, player.maxHp);
                log(`¡Has usado Cura y has recuperado ${healAmount} de vida!`);
                break;
        }
        
        enemiesAttack();
        updateStats();
        
        if (enemies.every(enemy => enemy.hp <= 0)) {
            defeatEnemies();
        } else {
            resetActions();
        }
    } else {
        log("No tienes suficientes PM para usar esta habilidad.");
        resetActions();
    }
}

function enemiesAttack() {
    enemies.forEach(enemy => {
        if (enemy.hp > 0) {
            const totalDefense = getTotalDefense();
            let damage = Math.max(enemy.attack - totalDefense, 0);
            player.hp = Math.max(player.hp - damage, 0);
            log(`¡${enemy.name} te ha atacado y te ha hecho ${damage} de daño!`);
        }
    });

    if (player.hp <= 0) {
        log("Te has quedado sin vida. Perdiste.");
        disableActions();
    }
}

function enemiesAttackWithDefense() {
    enemies.forEach(enemy => {
        if (enemy.hp > 0) {
            const totalDefense = getTotalDefense();
            let damage = Math.max(enemy.attack - totalDefense, 0);
            damage = Math.floor(damage / 2);
            player.hp = Math.max(player.hp - damage, 0);
            log(`¡Tu defensa ha reducido el daño! ${enemy.name} te ha atacado y te ha hecho ${damage} de daño.`);
        }
    });

    if (player.hp <= 0) {
        log("Te has quedado sin vida. Perdiste.");
        disableActions();
    }
}

function defeatEnemies() {
    let totalExperience = 0;
    let totalGold = 0;
    let allEnemiesDefeated = true;

    enemies.forEach((enemy, index) => {
        if (enemy.hp <= 0) {
            totalExperience += enemy.experienceReward;
            totalGold += enemy.goldReward;
            if (Math.random() < enemy.dropChance) {
                const drop = Math.random() < 0.7 ? "Poción" : getRandomEquipment(1);
                if (drop === "Poción") {
                    player.items.push("Poción");
                    log("¡Un enemigo ha dejado una poción!");
                } else {
                    log(`¡Un enemigo ha dejado ${drop.name}!`);
                    player.inventory.push(drop);
                }
            }
        } else {
            allEnemiesDefeated = false;
        }
    });
    
    log(`¡Has derrotado a algunos enemigos!`);
    player.experience += totalExperience;
    player.gold += totalGold;
    log(`¡Has ganado ${totalExperience} de experiencia y ${totalGold} de oro!`);

    if (isBossBattle) {
        isBossBattle = false;
        updateQuestProgress('boss');
    }
    updateQuestProgress('defeat');
    
    if (!allEnemiesDefeated) {
        log("Apuntando al siguiente enemigo...");
        targetNextEnemy();
    } else {
        log("¡Has derrotado a todos los enemigos! Sigues tu camino...");
        monsterLevel++;
        log(`Los enemigos se hacen más fuertes... (Nivel ${monsterLevel})`);
        spawnEnemies();
    }

    checkLevelUp();
    updateStats();
}

function targetNextEnemy() {
    const aliveEnemyIndex = enemies.findIndex(enemy => enemy.hp > 0);
    if (aliveEnemyIndex !== -1) {
        targetedEnemyIndex = aliveEnemyIndex;
        log(`Apuntando a ${targetedEnemyIndex}`);
    } else {
        log("No queda nadie a quien apuntar");
    }
}

function updateStats() {
    const totalAttack = getTotalAttack();
    const totalDefense = getTotalDefense();
    const totalMaxMp = getTotalMaxMp();

    document.getElementById('player-stats').innerHTML = `
        <strong>${player.name} (Nivel ${player.level})</strong><br>
        Vida: ${player.hp}/${player.maxHp}<br>
        PM: ${player.mp}/${totalMaxMp}<br>
        Ataque: ${totalAttack}<br>
        Defensa: ${totalDefense}<br>
        EXP: ${player.experience}/${player.experienceToNextLevel}<br>
        Oro: ${player.gold}<br>
        Objetos: ${player.items.join(', ')}<br>
    `;
          document.getElementById('enemy-stats').innerHTML = enemies.map((enemy, index) => `
          <div class="enemy-container ${index === targetedEnemyIndex ? 'targeted' : ''} ${enemy.hp <= 0 ? 'defeated' : ''}" 
               onclick="${enemy.hp > 0 ? `targetEnemy(${index})` : ''}">
              <strong>${enemy.name}</strong><br>
              Vida: ${enemy.hp}/${enemy.maxHp}<br>
              Ataque: ${enemy.attack}<br>
              Defensa: ${enemy.defense}
          </div>
      `).join('');
}

function getRandomEquipment(maxTier) {
    const availableEquipment = equipment.filter(item => item.tier <= maxTier);
    return availableEquipment[Math.floor(Math.random() * availableEquipment.length)];
}

function checkLevelUp() {
    if (player.experience >= player.experienceToNextLevel) {
        player.level++;
        player.experience -= player.experienceToNextLevel;
        player.experienceToNextLevel = Math.floor(player.experienceToNextLevel * 1.5);
        log(`¡Enhorabuena! ¡Has subido al nivel ${player.level}!`);
        updateQuestProgress('level');
        showLevelUpOptions();
    } else {
        resetActions();
    }
}

function showLevelUpOptions() {
    const options = ['Vida', 'PM', 'Ataque', 'Defensa'];
    const buttonsHtml = options.map(stat => 
        `<button onclick="levelUpStat('${stat.toLowerCase()}')">${stat}</button>`
    ).join('');
    
    document.getElementById('actions').innerHTML = `
        <div>Elige que atributo aumentar:</div>
        ${buttonsHtml}
    `;
}

function levelUpStat(stat) {
    switch(stat) {
        case 'vida':
            player.maxHp += 100;
            player.hp = player.maxHp;
            break;
        case 'pm':
            player.maxMp += 10;
            player.mp = player.maxMp;
            break;
        case 'ataque':
            player.attack += 5;
            break;
        case 'defensa':
            player.defense += 3;
            break;
    }
    log(`¡Tu ${stat.toUpperCase()} ha aumentado!`);
    resetActions();
    updateStats();
}

function showInventory() {
    const inventoryHtml = player.inventory.map((item, index) => 
        `<button onclick="equipItem(${index})">${item.name} (${item.type})</button>`
    ).join('');
    
    const combineHtml = `<button onclick="showCombineOptions()">Combinar equipamiento</button>`;
    
    document.getElementById('actions').innerHTML = `
    <div>Equipamiento: ${Object.entries(player.equipment).map(([slot, item]) => item ? `${slot}: ${item.name}` : `${slot}: Ninguno`).join(', ')} </div> 
    <div>Inventario:</div>
        ${inventoryHtml}
        ${combineHtml}
        <button onclick="resetActions()">Volver</button>
    `;
}

function showCombineOptions() {
    const combineableItems = player.inventory.filter(item => item.tier < 4);
    const combineHtml = combineableItems.map((item, index) => 
        `<button onclick="selectItemToCombine(${index})">${item.name} (${item.type})</button>`
    ).join('');
    
    document.getElementById('actions').innerHTML = `
        <div>Selecciona el primer objeto para combinar:</div>
        ${combineHtml}
        <button onclick="showInventory()">Volver</button>
    `;
}

function selectItemToCombine(index) {
    const firstItem = player.inventory[index];
    const compatibleItems = player.inventory.filter(item => 
        item.type === firstItem.type && item.tier === firstItem.tier && item !== firstItem
    );
    
    const combineHtml = compatibleItems.map((item, secondIndex) => 
        `<button onclick="combineItems(${index}, ${player.inventory.indexOf(item)})">${item.name}</button>`
    ).join('');
    
    document.getElementById('actions').innerHTML = `
        <div>Selecciona el segundo objeto para combinar con ${firstItem.name}:</div>
        ${combineHtml}
        <button onclick="showCombineOptions()">Volver</button>
    `;
}

function combineItems(index1, index2) {
    const item1 = player.inventory[index1];
    const item2 = player.inventory[index2];
    
    if (item1.type === item2.type && item1.tier === item2.tier && item1.tier < 4) {
        const newItem = equipment.find(e => e.type === item1.type && e.tier === item1.tier + 1);
        player.inventory = player.inventory.filter((_, i) => i !== index1 && i !== index2);
        player.inventory.push(newItem);
        log(`¡Has combinado ${item1.name} y ${item2.name} para crear ${newItem.name}!`);
    } else {
        log("Estos objetos no se pueden combinar.");
    }
    
    showInventory();
}

function equipItem(index) {
    const item = player.inventory[index];
    if (player.equipment[item.type]) {
        player.inventory.push(player.equipment[item.type]);
        log(`Has desequipado ${player.equipment[item.type].name}.`);
    }
    player.equipment[item.type] = item;
    player.inventory.splice(index, 1);
    log(`Has equipado ${item.name}!`);
    resetActions();
    updateStats();
}

function showShop() {
    const shopHtml = shopItems.map((item, index) => 
        `<button onclick="buyItem(${index})">${item.name} - ${item.cost} oro</button>`
    ).join('');
    
    document.getElementById('actions').innerHTML = `
        <div>Tienda (Oro: ${player.gold}):</div>
        ${shopHtml}
        <button onclick="resetActions()">Volver</button>
    `;
}

function buyItem(index) {
    const item = shopItems[index];
    if (player.gold >= item.cost) {
        player.gold -= item.cost;
        player.items.push(item.name);
        log(`Has comprado ${item.name} por ${item.cost} oro.`);
    } else {
        log("No tienes suficiente oro para comprar este objeto.");
    }
    showShop();
}

function showQuests() {
    const questHtml = quests.map((quest, index) => 
        `<div>${quest.description} - Progreso: ${quest.goalProgress}/${quest.goalTarget}</div>`
    ).join('');
    
    document.getElementById('actions').innerHTML = `
        <div>Misiones:</div>
        ${questHtml}
        <button onclick="resetActions()">Volver</button>
    `;
}

function updateQuestProgress(type) {
    quests.forEach(quest => {
        if (type === 'defeat' && quest.description.includes("Derrota")) {
            quest.goalProgress++;
        } else if (type === 'boss' && quest.description.includes("jefe")) {
            quest.goalProgress++;
        } else if (type === 'level' && quest.description.includes("nivel")) {
            quest.goalProgress = player.level;
        }
        
        if (quest.goalProgress >= quest.goalTarget) {
            log(`¡Has completado la misión: ${quest.description}!`);
            player.gold += quest.reward;
            log(`Recompensa: ${quest.reward} oro`);
            quest.goalProgress = 0;
            quest.goalTarget = Math.floor(quest.goalTarget * 1.5);
        }
    });
}

function resetActions() {
    document.getElementById('actions').innerHTML = `
        <button onclick="performAction('attack')">Ataque</button>
        <button onclick="performAction('defend')">Defensa</button>
        <button onclick="performAction('skill')">Habilidades</button>
        <button onclick="performAction('item')">Usar objeto</button>
        <button onclick="showInventory()">Equipo</button>
        <button onclick="showShop()">Tienda</button>
        <button onclick="showQuests()">Misiones</button>
    `;
}

function disableActions() {
    const buttons = document.querySelectorAll('#actions button');
    buttons.forEach(button => button.disabled = true);
}

function initGame() {
    spawnEnemies();
    resetActions();
    updateStats();
}

function getEquipmentBonus(type, stat) {
    const equipment = player.equipment[type];
    return equipment ? (equipment[stat + 'Bonus'] || 0) : 0;
}

function getTotalAttack() {
    return player.attack + getEquipmentBonus('weapon', 'attack') + getEquipmentBonus('accessory', 'attack');
}

function getTotalDefense() {
    return player.defense + getEquipmentBonus('armor', 'defense') + getEquipmentBonus('accessory', 'defense');
}

function getTotalMaxMp() {
    return player.maxMp + getEquipmentBonus('accessory', 'mp') + getEquipmentBonus('armor', 'mp');
}

window.onload = initGame;
window.performAction = performAction;
window.targetEnemy = targetEnemy;
window.showSkillOptions = showSkillOptions;
window.useSkill = useSkill;
window.showInventory = showInventory;
window.equipItem = equipItem;
window.showShop = showShop;
window.buyItem = buyItem;
window.showQuests = showQuests;
window.showCombineOptions = showCombineOptions;
window.selectItemToCombine = selectItemToCombine;
window.combineItems = combineItems;