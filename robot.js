function routeRobot(state, memory) {
    if (memory.length == 0) {
        memory = mailRoute;
    }
    return {
        direction: memory[0],
        memory: memory.slice(1)
    };
}

function randomPick(array) {
    let choise = Math.floor(Math.random() * array.length)
    return array[choise]
}

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
            return turn;
        }
        let action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
        console.log(`Отправляюсь в ${action.direction}`);
    }
}

function findRoute(graph, from, to) {
    let work = [{
        at: from,
        route: []
    }];
    for (let i = 0; i < work.length; i++) {
        let {
            at,
            route
        } = work[i];
        for (let place of graph[at]) {
            if (place == to) return route.concat(place)
            if (!work.some(item => item.at == place)) {
                work.push({
                    at: place,
                    route: route.concat(place)
                })
            }
        }
    }
}

function goalOrientedRobot({place,parcels}, route) {
    if (route.length == 0) {
        let parcel = parcels[0];
        if (parcel.place != place) {
            route = findRoute(roadGraph, place, parcel.place);
        } else {
            route = findRoute(roadGraph, place, parcel.address);
        }
    }
    return {
        direction: route[0],
        memory: route.slice(1)
    };
}

function upgradeRobot({place, parcels}, route)   {
        if (route.length == 0) {
          let routes = parcels.map(parcel => {
            if (parcel.place != place) {
              return {route: findRoute(roadGraph, place, parcel.place),
                      pickUp: true};
            } else {
              return {route: findRoute(roadGraph, place, parcel.address),
                      pickUp: false};
            }
          });
          function score({route, pickUp}) {
            return (pickUp ? 0.5 : 0) - route.length;
          }
          route = routes.reduce((a, b) => score(a) > score(b) ? a : b).route;
        }
      
        return {direction: route[0], memory: route.slice(1)};
      }
}

function compareRobots({robot: rob1, memory: mem1 = []}, {robot: rob2, memory: mem2 = []}, countSteps = 100) {
    let steps1 = 0,
        steps2 = 0;
    for (let i = 0; i <= countSteps; i++) {
        let newTask = VillageState.random();
        steps1 += runRobot(newTask, rob1, mem1);
        steps2 += runRobot(newTask, rob2, mem2);
    }
    console.log(`${rob1.name} справился за ${steps1/countSteps} ходов\n${rob2.name} справился за ${steps2/countSteps} ходов`);
}

let robot1 = {
    robot: function routeRobot(state, memory) {
        if (memory.length == 0) {
            memory = mailRoute;
        }
        return {
            direction: memory[0],
            memory: memory.slice(1)
        };
    }
}
let robot2 = {
    robot: function goalOrientedRobot({place,parcels}, route) {
        if (route.length == 0) {
            let parcel = parcels[0];
            if (parcel.place != place) {
                route = findRoute(roadGraph, place, parcel.place);
            } else {
                route = findRoute(roadGraph, place, parcel.address);
            }
        }
        return {
            direction: route[0],
            memory: route.slice(1)
        };
    }
}