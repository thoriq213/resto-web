<script lang="ts">
import { defineComponent } from "vue";
import { ref } from "vue";
import Cookies from 'js-cookie';
import request from "../core/services/ApiService";
import noPicture from "../assets/image/no_picture.jpg";

export default defineComponent({
  name: "menu",
  components: {},
  computed: {
},
methods: {
    formattedPrice(value: any) {
      return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    },
    setButtonActive(value:string){
        this.activeButton = value;
        this.getProduct();
    },
    async getCategory(){
        try {
            const getCategory = await request.get(`category/list`);
            const categoryList = getCategory.data.data;
            
            this.listCategory = categoryList;
            
        } catch (error : any) {
            console.log(error.response);
        }
    },
    async getProduct(){
        try {
            const getProduct = await request.get(`product/list`);
            const productList = getProduct.data.data;

            this.listProduct = productList;
        } catch (error : any) {
            console.log(error.response);
        }
    },
    addCart(id : any){
        const product = this.listProduct.find(val => val.id == id);
        this.cart.push(product);
    }
  },
  setup() {
    const listCategory = ref<Array<any>>([]);
    const listProduct = ref<Array<any>>([]);
    const token = Cookies.get('token');
    const activeButton = ref<string>('');
    const cart = ref<Array<any>>([]);

    return {
        listCategory,
        token,
        noPicture,
        activeButton,
        listProduct,
        cart
    };
  },
  mounted() {
    this.getCategory();
    this.getProduct();
  }
});
</script>

<template>
    <div class="">
        <div class="header py-10 px-5">
            <h1 class="fw-bolder">Find You Best Food</h1>
            <h2>Order & Enjoy</h2>
        </div>
        <div class="w-100 px-3 pb-5 d-flex gap-3" style="overflow-x: scroll;">
            <div :class="activeButton == '' ? 'btn btn-warning' : 'btn btn-secondary'" @click="setButtonActive('')">All</div>
            <div :class="activeButton == value.id ? 'btn btn-warning' : 'btn btn-secondary'" v-for="value of listCategory" :key="value.id" :value="value.id" @click="setButtonActive(value.id)">{{ value.name }}</div>
        </div>
        <div class="px-3 mt-5">
            <div class="row">
                <div class="col-6 mb-3" v-for="value of listProduct" :key="value.id">
                    <div class="card shadow-sm">
                        <div class="card-body p-0">
                            <div class="image h-100">
                                <img :src="value.image ? value.image : noPicture" alt="" srcset="" class="p-0 w-100" height="200">
                            </div>
                            <div class="detail p-5">
                                <h4>{{ value.name }}</h4>
                                <h5>{{ formattedPrice(value.price) }}</h5>
                                <div class="btn btn-success btn-md w-100 mt-5" @click="addCart(value.id)">tambah</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="cart p-5 me-5 bg-dark rounded-circle">
        <i class="far fa-solid fa-cart-shopping fs-2x text-white"></i>
    </div>
    <div class="cart-count bg-danger rounded-circle d-flex justify-content-center align-items-center">
        <span class="text-white">{{ cart.length }}</span>
    </div>
</template>
<style>
.cart {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 1000;
}
.cart-count {
  position: fixed;
  bottom: 40px;
  right: 20px;
  z-index: 1000;
  width: 30px;
  height: 30px;
}
</style>
