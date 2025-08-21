// Основная логика игры

// Класс героя
class Hero {
    constructor(name) {
        this.name = name || 'Герой';
        this.level = 1;
        this.experience = 0;
        this.nextLevelExperience = 100;
        this.strength = 10;
        this.agility = 10;
        this.intelligence = 10;
        this.skillPoints = 0;
    }

    gainExperience(amount) {
        this.experience += amount;
        while (this.experience >= this.nextLevelExperience) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.skillPoints++;
        this.nextLevelExperience *= 1.5;
        alert(`Поздравляю! Уровень повышен до ${this.level}, получите 1 очко навыков.`);
    }

    spendSkillPoint(stat) {
        if (this.skillPoints > 0) {
            this[stat]++;
            this.skillPoints--;
            alert(`Повышена характеристика '${stat}' до значения ${this[stat]}`);
        } else {
            alert('Недостаточно очков навыков.');
        }
    }
}

// Класс NPC
class Npc {
    constructor(x, y, text) {
        this.position = { x, y };
        this.text = text;
    }

    talk() {
        const dialogBox = new DialogBox(
            ['Да, расскажи.', 'Нет, спешу далее'],
            choiceIndex => {
                if (choiceIndex === 0) {
                    alert("Старец рассказывает древнюю легенду.");
                } else {
                    alert("Путешествие продолжается...");
                }
            }
        );
    }

    offerQuest(quest) {
        if (!quest.isCompleted()) {
            const dialogBox = new DialogBox(['Принять', 'Отказаться'], choiceIndex => {
                if (choiceIndex === 0) {
                    alert(`Вы приняли квест "${quest.name}"\nЦель: ${quest.description}`);
                    currentQuest = quest;
                } else {
                    alert('Квест отклонён.');
                }
            });
        } else {
            alert('Этот квест уже завершён!');
        }
    }
}

// Класс квеста
class Quest {
    constructor(name, description, objectives, reward) {
        this.name = name;
        this.description = description;
        this.objectives = objectives;
        this.reward = reward;
        this.completed = false;
    }

    isCompleted() {
        return Object.values(this.objectives).every(obj => obj.count >= obj.requiredCount);
    }

    completeQuest() {
        this.completed = true;
        alert(`${this.name}: Квест выполнен!\nНаграда: ${this.reward.gold} золота`);
    }
}

// Класс диалогового окна
class DialogBox {
    constructor(textOptions, callback) {
        this.textOptions = textOptions;
        this.callback = callback;
        
        this.container = document.createElement('div');
        this.container.className = 'dialog-box';
        
        for (let i = 0; i < textOptions.length; i++) {
            const button = document.createElement('button');
            button.textContent = textOptions[i];
            button.addEventListener('click', () => {
                this.close();
                callback(i);
            });
            this.container.appendChild(button);
        }
        
        document.body.appendChild(this.container);
    }
    
    close() {
        document.body.removeChild(this.container);
    }
}

// Класс гриба
class Mushroom {
    constructor(type, x, y) {
        this.type = type;
        this.position = { x, y };
    }

    collect() {
        if (currentQuest && currentQuest.objectives.some(obj => obj.type === this.type)) {
            const objective = currentQuest.objectives.find(obj => obj.type === this.type);
            objective.count++;
            alert(`Вы собрали гриб типа ${this.type}. Осталось собрать ещё ${objective.requiredCount - objective.count}`);
        }
    }
}

// Создание героя
const player = new Hero('Игорь');

// Создание NPC
const npc1 = new Npc(200, 200, 'Привет путник! Нужны ли тебе советы мудрого старца?');

// Первый квест
const questGatherMushrooms = new Quest(
    'Сбор лечебных грибов',
    'Собери лечебные грибы для старца.',
    [
        { type: 'milkCap', count: 0, requiredCount: 3 },
        { type: 'flyAgaric', count: 0, requiredCount: 2 },
        { type: 'bolete', count: 0, requiredCount: 1 }
    ],
    { gold: 50, experience: 100 }
);

// Грибы на карте
const mushrooms = [
    new Mushroom('milkCap', 150, 250),
    new Mushroom('flyAgaric', 300, 350),
    new Mushroom('bolete', 450, 150)
];

// Графическое представление игры
const canvas = document.createElement('canvas');
canvas.id = 'game-canvas';
canvas.width = window.innerWidth * 0.75;
canvas.height = window.innerHeight * 0.75;
document.getElementById('game-container').appendChild(canvas);
const ctx = canvas.getContext('2d');

// Позиция героя
let heroPosition = { x: 100, y: 100 };

// Переменная для текущего активного квеста
let currentQuest = null;

// Игра начинается с предлагаемого квеста
npc1.offerQuest(questGatherMushrooms);

// Начальные координаты и размеры карты
const mapSize = { width: 600, height: 600 };

// Рендеринг сцены
function drawMap() {
    ctx.fillStyle = '#BADA55'; // Цвет травы
    ctx.fillRect(0, 0, mapSize.width, mapSize.height);
}

function drawHero() {
    ctx.beginPath();
    ctx.arc(heroPosition.x, heroPosition.y, 20, 0, Math.PI*2);
    ctx.fillStyle = '#FFD700'; // Золотистый цвет героя
    ctx.fill();
}

// Контроль позиции героя через мышь и сенсорные экраны
window.addEventListener('mousemove', event => {
    heroPosition.x = event.clientX;
    heroPosition.y = event.clientY;
});

window.addEventListener('touchmove', event => {
    heroPosition.x = event.touches[0].clientX;
    heroPosition.y = event.touches[0].clientY;
});

// Проверка столкновения с NPC
function checkNpcCollision() {
    if (
        Math.abs(heroPosition.x - npc1.position.x) <= 50 &&
        Math.abs(heroPosition.y - npc1.position.y) <= 50
    ) {
        npc1.talk();
    }
}

// Проверка возможности сбора грибов
function checkMushroomCollection() {
    mushrooms.forEach(mushroom => {
        if (
            Math.abs(heroPosition.x - mushroom.position.x) <= 50 &&
            Math.abs(heroPosition.y - mushroom.position.y) <= 50
        ) {
            mushroom.collect();
        }
    });
}

// Основной цикл игры
function gameLoop() {
    requestAnimationFrame(gameLoop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawHero();
    checkNpcCollision();
    checkMushroomCollection();

    if (currentQuest && currentQuest.isCompleted()) {
        currentQuest.completeQuest();
        currentQuest = null;
    }
}

gameLoop();
