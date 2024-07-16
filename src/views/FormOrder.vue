<script lang="ts">
import logo from "../assets/image/logo.png";
import { defineComponent } from "vue";
import request from "../core/services/ApiService";
import { useField, useForm } from "vee-validate";
import { ref } from "vue";
import Cookies from 'js-cookie';
import { useRouter } from "vue-router";

export default defineComponent({
  name: "main-dashboard",
  components: {},
  methods: {},
  setup() {
    const tableErrorApi = ref<string>('');
    const nameErrorApi = ref<string>('');
    const noHpErrorApi = ref<string>('');
    const router = useRouter();
    const isLoading = ref<boolean>(false)
    
    const simpleSchema = {
      name(value: string) {
        if (value && value.trim()) {
          return true;
        }

        return "Nama is required";
      },
      table(value: string) {
        if (value && value.trim()) {
          return true;
        }

        return "Nomor Meja is required";
      },
      noHp(value: string) {
        if (value && value.trim()) {
          return true;
        }

        return "Nomor Handphone is required";
      },
    };

    // Create a form context with the validation schema
    useForm({
      validationSchema: simpleSchema,
    });

    // No need to define rules for fields
    const { value: table, errorMessage: tableError } = useField("table");
    const { value: name, errorMessage: nameError } = useField("name");
    const { value: noHp, errorMessage: noHpError } = useField("noHp");

    const submit = async () => {
      if (!tableError.value && !nameError.value && !noHpError.value) {
        isLoading.value = true;
        const body = {
          name: name.value,
          phone: noHp.value,
          table_no: table.value,
        };
        
        try {
          const sendApi = await request.post(`auth/login_guest`, body);
          const data = sendApi.data;
          const minutes = 15;
          const expires = minutes / 1440;
          Cookies.set('token', data.token, { expires: expires });
          setTimeout(() => {
            router.push({name: 'menu'});
          }, 2000);
          console.log('ini kelar');
          
        } catch (error : any) {
          console.log(error);
      
          isLoading.value = false;
          const res = error.response.data;
          if(typeof res.msg == 'object'){
            res.msg.forEach(element => {
              if(element.path == 'name') {
                nameErrorApi.value = element.msg;
              }
              else if(element.path == 'phone') {
                noHpErrorApi.value = element.msg;
              }
              else if(element.path == 'table_no') {
                tableErrorApi.value = element.msg;
              }
            });
          }
          
        }
        
      }
    };

    const numberOnly = (event: any) => {
      const input = event.target.value;
      table.value = input.replace(/\D/g, "");
    };

    return {
      table,
      tableError,
      name,
      nameError,
      noHp,
      noHpError,
      logo,
      submit,
      numberOnly,
      tableErrorApi,
      nameErrorApi,
      noHpErrorApi,
      isLoading
    };
  },
});
</script>

<template>
  <div class="d-flex justify-content-center py-20 mb-20">
    <img class="" :src="logo" alt="" height="150" />
  </div>
  <div class="px-3 bg-dark py-10">
    <center class="mb-10">
      <h3 class="text-light">SILAHKAN ISI MEJA DAN DATA DIRI</h3>
    </center>
    <form action="">
      <div class="form-group mb-5">
        <label class="fs-4 fw-bold form-label text-light" for="">Meja</label>
        <input
          v-numeric-only
          class="form-control"
          type="text"
          name="table"
          id="table"
          v-model="table"
          @keyup="numberOnly"
        />
        <span class="text-danger">{{ tableErrorApi ? tableErrorApi : tableError }}</span>
      </div>
      <div class="form-group mb-5">
        <label class="fs-4 fw-bold form-label text-light" for="">Nama</label>
        <input
          class="form-control"
          type="text"
          name="name"
          id="name"
          v-model="name"
        />
        <span class="text-danger">{{ nameErrorApi ? nameErrorApi : nameError }}</span>
      </div>
      <div class="form-group mb-5">
        <label class="fs-4 fw-bold form-label text-light" for="">Nomor Handphone</label>
        <input
          class="form-control"
          type="text"
          name="no_hp"
          id="no_hp"
          v-model="noHp"
        />
        <span class="text-danger">{{ noHpErrorApi ? noHpErrorApi : noHpError }}</span>
      </div>
      <div class="form-group mt-15">
        <div v-if="isLoading" class="spinner-border text-light" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <div v-else class="btn btn-light w-50" @click="submit">Submit</div>
      </div>
    </form>
  </div>
  <div class="d-flex align-items-end mt-20 px-5">
    <p class="fs-5">
      Tidak Dapat Memesan? Silahkan Hubungi
      <span class="fw-bold">Pelayan</span> Untuk Memesan Makanan
    </p>
  </div>
</template>
