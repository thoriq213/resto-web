<script lang="ts">
import { defineComponent } from "vue";
import { ref } from "vue";
import Cookies from 'js-cookie'
import request from "../core/services/ApiService";
import noPicture from "../assets/image/no_picture.jpg";
import router from "@/router/clean";

export default defineComponent({
    name: "menu",
    components: {},
    computed: {
    },
    methods: {
        formattedPrice(value: any) {
            return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
        },
        setButtonActive(value: string) {
            this.activeButton = value;
            this.getProduct();
        },
        async getCategory() {
            try {
                const getCategory = await request.get(`category/list`);
                const categoryList = getCategory.data.data;

                this.listCategory = categoryList;

            } catch (error: any) {
                console.log(error.response);
            }
        },
        async getProduct() {
            this.loading = true;
            try {
                const getProduct = await request.get(`product/list`, this.activeButton);
                const productList = getProduct.data.data;
                this.loading = false;

                this.listProduct = productList;
            } catch (error: any) {
                console.log(error.response);
                this.listProduct = [];
                this.loading = false;
            }
        },
        addCart(id: any) {
            const product = this.listProduct.find(val => val.id == id);
            this.cart.push(product);
            
            const groupedData = this.cart.reduce((acc, item) => {
                if (!acc[item.id]) {
                    acc[item.id] = {total: 0, name: '', price: ''};
                }
                acc[item.id].total += 1;
                acc[item.id].name = item.name
                acc[item.id].price = item.price
                return acc;
            }, {});

            const totalPrice = this.cart.reduce((acc, item) => {
                return acc + item.price;
            }, 0);

            // Mengonversi hasil pengelompokan menjadi array objek
            const result = Object.keys(groupedData).map(product_id => ({
                product_id: product_id,
                qty: groupedData[product_id].total,
                name: groupedData[product_id].name,
                price: groupedData[product_id].price,
                totalPrice: parseInt(groupedData[product_id].price) * parseInt(groupedData[product_id].total)
            }));

            this.cartDetail = result;
            this.totalPrice = totalPrice;
        },
        removeCart(id: any) {
            const index = this.cart.findIndex(val => val.id == id);
            
            if (index !== -1) {
                this.cart.splice(index, 1);
            }
            
            const groupedData = this.cart.reduce((acc, item) => {
                if (!acc[item.id]) {
                    acc[item.id] = {total: 0, name: '', price: ''};
                }
                acc[item.id].total += 1;
                acc[item.id].name = item.name
                acc[item.id].price = item.price
                return acc;
            }, {});

            const totalPrice = this.cart.reduce((acc, item) => {
                return acc + item.price;
            }, 0);

            // Mengonversi hasil pengelompokan menjadi array objek
            const result = Object.keys(groupedData).map(product_id => ({
                product_id: product_id,
                qty: groupedData[product_id].total,
                name: groupedData[product_id].name,
                price: groupedData[product_id].price,
                totalPrice: parseInt(groupedData[product_id].price) * parseInt(groupedData[product_id].total)
            }));

            this.cartDetail = result;
            this.totalPrice = totalPrice;
        },
        async order(){
            const productBody = this.cartDetail.map(item => ({product_id: item.product_id, qty: item.qty}));
            const body = {
                product_list: productBody
            }
            try {
                const sendApi = await request.post('transaction/add-transaction', body);
                
                if(sendApi.status == 200){
                    Cookies.remove('token');
                    router.push({name: 'form'});
                }
                   
            } catch (error : any) {
                const res = error.response.data;
                console.log(res);
                
            }
            
            
        }
    },
    setup() {
        const listCategory = ref<Array<any>>([]);
        const listProduct = ref<Array<any>>([]);
        const token = Cookies.get('token');
        const activeButton = ref<string>('0');
        const cart = ref<Array<any>>([]);
        const cartDetail = ref<Array<any>>([]);
        const loading = ref<boolean>(true);
        const totalPrice = ref<number>(0);

        return {
            listCategory,
            token,
            noPicture,
            activeButton,
            listProduct,
            cart,
            loading,
            cartDetail,
            totalPrice
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
            <div :class="activeButton == '0' ? 'btn btn-dark' : 'btn btn-secondary'" @click="setButtonActive('0')">All
            </div>
            <div :class="activeButton == value.id ? 'btn btn-dark' : 'btn btn-secondary'" v-for="value of listCategory"
                :key="value.id" :value="value.id" @click="setButtonActive(value.id)">{{ value.name }}</div>
        </div>
        <div class="px-3 mt-5" v-if="loading == false">
            <div class="row">
                <div class="col-6 mb-3" v-for="value of listProduct" :key="value.id">
                    <div class="card shadow-sm">
                        <div class="card-body p-0">
                            <div class="image h-100">
                                <img :src="value.image ? value.image : noPicture" alt="" srcset="" class="p-0 w-100"
                                    height="200">
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
        <div class="px-3 mt-5 d-flex justify-content-center align-items-center" v-else>
            <div class="spinner-border text-dark" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    </div>
    <div class="cart p-5 me-5 bg-dark rounded-circle" role="button" type="button" data-bs-toggle="modal"
        data-bs-target="#kt_modal_scrollable_2">
        <i class="far fa-solid fa-cart-shopping fs-2x text-white"></i>
    </div>
    <div class="cart-count bg-danger rounded-circle d-flex justify-content-center align-items-center">
        <span class="text-white">{{ cart.length }}</span>
    </div>
    <div class="modal fade" tabindex="-1" id="kt_modal_scrollable_2">
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Detail Cart</h5>

                    <!--begin::Close-->
                    <div class="btn btn-icon btn-sm btn-active-light-primary ms-2" data-bs-dismiss="modal"
                        aria-label="Close">
                        <i class="ki-duotone ki-cross fs-2x"><span class="path1"></span><span class="path2"></span></i>
                    </div>
                    <!--end::Close-->
                </div>

                <div class="modal-body">
                    <div class="card shadow-sm mb-3" v-for="value of cartDetail" :key="value.product_id">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-6">
                                    <div class="fs-3 fw-bold">{{ value.name }}</div>
                                    <div class="fs-6">{{ formattedPrice(value.price) }}</div>
                                </div>
                                <div class="col-6 d-flex justify-content-end align-items-center">
                                    <div class="btn btn-sm btn-dark fs-2" @click="removeCart(value.product_id)">-</div>
                                    <input type="text" class="form-control w-25 mx-1 text-center-input" :value="value.qty" readonly/>
                                    <div class="btn btn-sm btn-dark fs-2" @click="addCart(value.product_id)">+</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="d-flex justify-content-between align-items-center p-8">
                    <div class="">
                        <div class="fs-4 fw-bold">Total</div>
                        <div class="fs-2 fw-bolder">{{ formattedPrice(totalPrice) }}</div>
                    </div>
                    <div class="">
                        <button type="button" class="btn btn-light me-2" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-dark" @click="order" data-bs-dismiss="modal">Order</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
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

.text-center-input {
    text-align: center;
}
</style>
