<template>
  <div class="container">
    <h1>Данные о погоде на {{ currentDate }} г. </h1>
    <label for="cities_number" v-if="show_cities_number">
      Количество городов(не более 20):
      <input class="form-control" id="cities_number" v-on:input="checkNumber" v-model="value" type="number" />
    </label>

    <ul class="list-group">
      <li class="list-group-item" v-if="cities.length !== 0" v-for="city in cities" :key="city.id" @click="saveData(city, $event)">
        <div>{{ city.name }}</div>
        <div class="weather-block">
          <div class="weather-with-icon">
            <img :src="`https://openweathermap.org/img/w/${city.weather[0].icon}.png`" :alt="`Weather ${city.name}, ${city.sys.country}`" width="50" height="50">
            <div>{{ city.weather[0].description }}</div>
            <div class="temperature">температура: {{ Math.round(city.main.temp) }}&#176; C</div>
          </div>
          <div>влажность: {{ city.main.humidity }}%</div>
          <div>облачность: {{ city.clouds.all }}%</div>
        </div>
      </li>
      <li v-if="cities.length == 0">Город не найден</li>
    </ul>
    <div class="container">
      <button type="button" @click="openFilterForm" class="btn btn-primary">Поиск города</button>
      <button v-if="save_to_file" type="button" @click="saveToFile(saving_data)" class="btn btn-primary">Сохранить в файл</button>
    </div>
    
  </div>
</template>

<script>
const axios = require("axios");
const fs = require("fs");
const { dialog } = require("electron").remote;
const { remote, ipcRenderer } = require("electron");
import cities_list from '../../city.list.json';
let cities_number = 10;
let cities_id = [];

export default {
  data() {
    return {
      cities: [],
      value: '',
      city: '',
      show_cities_number: true,
      save_to_file: false,
      saving_data: [],
    }
  },
  created() {
    this.getCities();
  },
  updated() {
    ipcRenderer.on('filter', (event, arg) => {
      this.city = arg;
      this.show_cities_number = false;
      this.saving_data = [];
      this.save_to_file = false;
    });
  },
  methods: {
    getCities() {
      this.getCitiesId(),
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/group?id=${cities_id}&units=metric&appid=38e8e4238b44d4a61411c27d5028d1cb&lang=ru`
        )
        .then(response => {
          console.log(response);
          this.cities = response.data.list;
        })
        .catch(error => {
          this.cities = []
          console.log(error);
        });
    },
    checkNumber(e) {
      cities_number = +e.target.value;
      this.getCities()
    },
    getCitiesId() {
      cities_id = [];
      if (this.city === '') {
        for (let i = 0; i < cities_number; i++) {
          cities_id.push(cities_list[i].id)
        }
      } else if (this.city !== '') {
        for (let i = 0; i < this.city.length; i++) {
          cities_id.push(this.city[i].id)
        }
      }
      
    },
    openFilterForm() {
      ipcRenderer.send("open-filter")
    },
    getFilteredCities() {
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&units=metric&appid=38e8e4238b44d4a61411c27d5028d1cb&lang=ru`
        )
        .then(response => {
          console.log(response);
          this.cities = [];
          this.cities.push(response.data);
        })
        .catch(error => {
          console.log(error);
        });
    },
    saveData(city, event) {
      this.save_to_file = true;
      if (this.saving_data.length === 0) {
        this.saving_data.push(city)
      } else {
          if (this.saving_data.some(e => e.id === city.id)) {
            this.saving_data.splice(this.saving_data.indexOf(city), 1);
          } else {
            this.saving_data.push(city);
          }
      }
      const li = event.target;
      li.classList.toggle('active');
    },
    saveToFile(saving_data) {
      let content = [];
      for (let i = 0; i < saving_data.length; i++) {
        content.push(`Название города: ${saving_data[i].name}, Температура: ${Math.round(saving_data[i].main.temp)} C, Влажность: ${saving_data[i].main.humidity}%`);
      }
      
      dialog.showSaveDialog((filename) => {
        if (filename === undefined) {
          console.log('error no filename');
          return;
        }

        fs.writeFile(filename, content, (err) => {
          if(err) {
            return;
          }
        })
      });
    }
  },
  computed: {
    currentDate() {
      let today = new Date();
      let dd = today.getDate();
      let mm = today.getMonth() + 1;
      let yyyy = today.getFullYear();

      if(dd < 10) {
          dd = '0'+dd
      } 
      if(mm < 10) {
          mm = '0'+mm
      } 

      today = dd + '.' + mm + '.' + yyyy;
      return today;
    }
  },
  watch: {
    city: function() {
      this.city !== '' && typeof this.city === 'string' && this.getFilteredCities();
      typeof this.city === 'object' && this.getCities();
    }
  }
}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.list-group {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: column;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: 0;
}
.list-group-item {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  margin-bottom: -1px;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.125);
}
.list-group-item:hover {
  background-color: #eeefff;
  cursor: pointer;
}
.list-group-item.active {
  background-color: #eee;
  color: #000;
}
.weather-block {
  min-width: 175px;
  text-align: center;
}
.container {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
}
.btn {
  outline: none;
  margin-right: 10px;
}
</style>
