function randomPick(array) {
    let choise = Math.floor(Math.random() * array.length)
    return array[choise]
}

function randomRobot(state) {
    return {
        direction: randomPick(roadGraph[state.place])
    }
}

const roads = [
    "Дом Алисы-Дом Боба", "Дом Алисы-Склад",
    "Дом Алисы-Почта", "Дом Боба-Ратуша",
    "Дом Дарии-Дом Эрни", "Дом Дарии-Ратуша",
    "Дом Эрни-Дом Греты", "Дом Греты-Ферма",
    "Дом Греты-Магазин", "Рынок-Ферма",
    "Рынок-Почта", "Рынок-Магазин",
    "Рынок-Ратуша", "Магазин-Ратуша"
]
let mailRoute = [
    "Дом Алисы", "Склад", "Дом Алисы", "Дом Боба",
    "Ратуша", "Дом Дарии", "Дом Эрни",
    "Дом Греты", "Магазин", "Дом Греты", "Ферма",
    "Рынок", "Почта"
]

function buildGraph(edges) {
    let graph = Object.create(null)

    function addEdge(from, to) {
        if (graph[from] == null) {
            graph[from] = [to]
        } else {
            graph[from].push(to)
        }
    }
    for (let [from, to] of edges.map(e => e.split("-"))) {
        addEdge(from, to)
        addEdge(to, from)
    }
    return graph
}

const roadGraph = buildGraph(roads)

class VillageState {
    constructor(place, parcels) {
        this.place = place
        this.parcels = parcels
    }

    move(destination) {
        if (!roadGraph[this.place].includes(destination)) {
            return this
        } else {
            let parcels = this.parcels.map(parcel => {
                if (parcel.place != this.place) return parcel;
                return {
                    place: destination,
                    address: parcel.address
                }
            }).filter(parcel => parcel.address != parcel.place);
            return new VillageState(destination, parcels);
        }
    }

    static random(parcelCount = 5) {
        let parcels = [];
        for (let i = 0; i < parcelCount; i++) {
            let address = randomPick(Object.keys(roadGraph)),
                place;
            do {
                place = randomPick(Object.keys(roadGraph));
            } while (place == address)
            parcels.push({
                place,
                address
            });
        }
        return new VillageState("Почта", parcels)
    }
}

function runRobot(state, robot, memory) {
    for (let turn = 0;; turn++) {
        if (state.parcels.length == 0) {
            console.log(`Выполнено за ${turn} ходов`);
            break
        }
        let action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
        console.log(`Переход в направлении: ${action.direction}`);
    }
}

function routeRobot(state, memory) {
    if (memory.length == 0) {
        memory = mailRoute;
    }
    return {
        direction: memory[0],
        memory: memory.slice(1)
    };
}

runRobot(VillageState.random(), routeRobot, mailRoute);