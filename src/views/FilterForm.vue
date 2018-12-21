<template>
  <div class="container">
    <h1>Поиск по городам</h1>
    <div class="form-check">
      <input id="name" class="form-check-input" name="form_type" type="radio" value="1" v-model="picked" />
      <label for="name" class="form-check-label">По названию</label>
    </div>
    <div class="form-check">
      <input id="country" class="form-check-input" name="form_type" type="radio" value="2" v-model="picked" />
      <label for="country" class="form-check-label">По стране</label>
    </div>
    <form class="form-inline" v-if="picked == 1">
      <div class="form-group mb-2">
        <label for="city_name">
          Введите название города:
        </label>
        <input class="form-control" id="city_name" v-model="city_name" />
      </div>
      <button class="btn btn-primary" @click="closeFilterForm(city_name)">Найти</button>
    </form>
    <form class="form-with-country" v-if="picked == 2">
      <label for="country_name">Страна (зажмите клавишу shift для множественного выбора городов):</label>
      <select class="form-control" v-model="country">
        <option value="" disabled selected>Выберите страну</option>
        <option value="RU">Россия</option>
        <option value="JP">Япония</option>
        <option value="GB">Великобритания</option>
        <option value="US">США</option>
      </select>
      <select class="form-control form-control-cities" multiple v-model="city" v-if="cities.length > 0">
        <option :value="city" v-for="(city, index) in cities" :key="index">{{ city.name }}</option>
      </select>
      <button class="btn btn-primary btn-search" type="submit" @click="closeFilterForm(city)">Найти</button>
    </form>
  </div>
</template>

<script>
  const { remote, ipcRenderer } = require("electron");
  import cities_list from '../../city.list.json';


  export default {
    data() {
      return {
        picked: 1,
        country: '',
        city_name: '',
        cities: [],
        city: {}
      }
    },
    methods: {
      closeFilterForm(city_name) {
        ipcRenderer.send("close-filter", city_name);
      },
      getCitiesOfCurrentCountry() {
        this.cities = [];
        for (let i = 0; i < cities_list.length; i++) {
          if (cities_list[i].country === this.country) {
            this.cities.push({
              name: cities_list[i].name,
              id: cities_list[i].id
            })
          }
        }
      }
    },
    watch: {
      country: function() {
        this.country && this.getCitiesOfCurrentCountry()
      }
    }
  }
</script>

<style scoped>
.btn {
  margin-bottom: .5rem!important;
  margin-left: 40px;
}
.btn-search {
  margin-top: 20px;
}
.form-control {
  margin-left: 30px;
}
.form-check {
  margin-top: 10px;
}
.form-check-label,
.form-check-input {
  cursor: pointer;
}
.form-with-country,
.form-inline {
  margin-top: 20px;
}
.form-control-cities {
  margin-top: 15px;
  height: 200px!important;
}
</style>