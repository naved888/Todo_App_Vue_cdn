const store = new Vuex.Store({
    state: {
        todos: [],
    },
    actions: {
        async getTodos({
            commit
        }) {
            const response = await axios.get(`http://localhost:3000/todos`);
            commit("setTodos", response.data);
        },
        async addTodos({
            commit
        }, todos) {
            const response = await axios.post(`http://localhost:3000/todos`, todos);
            commit("newTodos", response.data);
        },
        async deleteTodos({
            commit
        }, id) {
            const response = axios({
                method: "DELETE",
                url: "http://localhost:3000/todos/" + id,
            });
            commit("removeTodos", response.data);
        },
    },
    getters: {
        todos: (state) => state.todos,
    },
    mutations: {
        setTodos(state, todos) {
            state.todos = todos;
        },
        newTodos(state, todos) {
            state.todos.push(todos);
        },
        removeTodos(state, todos) {
            state.todos.push(todos);
        },
    },
});
let item = {
        name: "Item",
        data() {
            return {
                listName: "",
                listItem: []
            };
        },
        computed: {
            todos() {
                return store.state.todos;
            },
        },
        props: {
            sort: String,
        },
        watch: {
            sort: function (sort) {
                if (sort === "All") {
                    store.dispatch("getTodos");
                    this.getItems();
                } else if (sort === "Completed") {
                    store.dispatch("getTodos");
                    this.getItems();
                    this.listItem = this.listItem.filter((item) => {
                        return item.status === true;
                    });
                } else {
                    store.dispatch("getTodos");
                    this.getItems();
                    this.listItem = this.listItem.filter((item) => {
                        return item.status === false;
                    });
                }
            },
        },
        methods: {
            getItems() {
                store.state.todos.forEach((todo) => {
                    if (parseInt(this.$route.params.id) === todo.id) {
                        this.listItem = todo.listItem
                    }
                });
            },
            addItem() {
                this.listName = document.getElementById("inputItem").value;
                store.state.todos.forEach((todo) => {
                    if (
                        parseInt(this.$route.params.id) === todo.id &&
                        todo.listItem !== undefined
                    ) {
                        todo.listItem.push({
                            id: new Date().getTime(),
                            name: this.listName,
                            status: false,
                        });
                        axios.put("http://localhost:3000/todos/" + todo.id, todo);
                    } else if (parseInt(this.$route.params.id) === todo.id) {
                        todo["listItem"] = [{
                            id: new Date().getTime(),
                            name: this.listName,
                            status: false,
                        }, ];
                        axios.put("http://localhost:3000/todos/" + todo.id, todo);
                    }
                });
                document.getElementById("inputItem").value = "";
            },
            deleteList(item) {
                store.state.todos.forEach((todo) => {
                    if (parseInt(this.$route.params.id) === todo.id) {
                        const listIndex = todo.listItem.indexOf(item);
                        todo.listItem.splice(listIndex, 1);
                        axios.put("http://localhost:3000/todos/" + todo.id, todo);
                        store.dispatch('getTodos')
                    }
                });
            },
            done(item) {
                store.state.todos.forEach((todo) => {
                    console.log(todo.listItem)
                    const listIndex = this.listItem.indexOf(item);
                    console.log(listIndex)
                    if (todo.listItem[listIndex].status == false) {
                        todo.listItem[listIndex].status = true;
                    } else {
                        todo.listItem[listIndex].status = false;
                    }
                    axios.put("http://localhost:3000/todos/" + todo.id, todo);
                });
            },
        },
        mounted() {
            setTimeout(() => {
                this.getItems();
            }, 1000)
        },
  template: `
  <div class="listitems">
        <ul>
            <li v-for="item in listItem" :key="item.id">
            <input v-model="item.done" @change="done(item)" type="checkbox"
                    name="status" id="status"><span :class="{done: item.done}">{{item.name}}</span>
                <img src="../assets/trash.png" alt="" @click="deleteList(item)"></li>
        </ul>
        <div class="d-flex">
            <input type="text" name="" id="inputItem" v-on:keyup.enter="addItem()">
            <button  @click.prevent="addItem()">Add</button>
        </div>
    </div>
    `,
};
let todositem = {
        data() {
            return {
                todo: {},
                sort: "",
                selected: "All",
            };
        },
        methods: {
            selectChange() {
                this.sort = this.selected;
            },
        },
        computed: {
            todos() {
                return store.state.todos;
            },
        },
        mounted() {
            store.dispatch('getTodos')
            setTimeout(() => {
                store.state.todos.forEach((todo) => {
                    if (parseInt(this.$route.params.id) === todo.id) {
                        this.todo = todo;
                    }
                });
            }, 1000)
        },
        components: {
            appItem: item,
        },
  template: `
        <div>
            <div class="main-section-1">
                <h1>
                    <router-link :to="'/todos'"><img src="../assets/back.png" alt=""></router-link>{{todo.name}}
                    <select v-bind:onchange="selectChange(selected)" name="" id="filter" v-model="selected">
                    <option value="All" selected>All</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                </select>
                </h1>
                <app-item :sort="sort"></app-item>
            </div>
        </div>
    `,

  };
  let list = {
          computed: {
              todos() {
                  return store.state.todos;
              },
          },
          created() {
              store.dispatch("getTodos");
          },
          methods: {
              deleteList(todo) {
                  store.dispatch("deleteTodos", todo.id);
              },
          },
  template: `
    <div>
        <div class="d-flex list-group" v-for="todo in todos" :key="todo.id">
            <a href="#" class="list-group-item list-group-item-action list list-group-item-warning">
                <router-link :to="'/todos/' + todo.id">
                    {{todo.name}}
                </router-link>
            <img class="trash" src="../assets/trash.png" alt="" @click="deleteList(todo)">
            </a>            
        </div>
    </div>
    `,
};
let Todos = {
methods: {
        showModal() {
            let a = document.getElementById("addList");
            if (a.style.display === "none") {
                a.style.display = "block";
            } else {
                a.style.display = "none";
            }
        },
        addListItem() {
            this.listName = document.getElementById("inputItem").value;
            store.dispatch("addTodos", {
                id: new Date().getTime(),
                name: this.listName,
            });
        },
    },
    data() {
        return {
            listName: "",
        };
    },
    components: {
        list: list,
    },
    name: "todos",
    template: `
    <div class="main-section">
        <h1>To Do Lists</h1>
        <img src="../assets/more.png" class="plus" @click="showModal()">
        <div id="addList" style="display:none">
            <input type="text" id="inputItem" size="89"></input>
            <button @click="addListItem()">Add</button>
        </div>
        <list ></list>   
    </div>
    `,
};
const router = new VueRouter({
    routes: [{
            path: "/",
            redirect: {
                name: "Todos",
            },
        },
        {
            path: "/todos",
            name: "Todos",
            component: Todos,
        },
        {
            path: "/todos/:id",
            component: todositem,
        },
    ],
});
new Vue({
    router,
    el: "#app",
    components: {
        todos: Todos,
        todositem: todositem,
    },
});