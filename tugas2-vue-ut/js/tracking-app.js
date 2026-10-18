// Data dummy paket dan pengiriman yang digunakan oleh halaman tracking.html.
var dataSITTA = {
 
  paket: [
    { kode: "PAKET-UT-001", nama: "Paket IPS Dasar", isi: ["EKMA4116", "EKMA4115"], harga: 120000 },
    { kode: "PAKET-UT-002", nama: "Paket IPA Dasar", isi: ["BIOL4201", "FISIP4001"], harga: 140000 }
  ],
  tracking: {
        "DO2025-0001": {
          nim: "123456789",
          nama: "Rina Wulandari",
          status: "Dalam Perjalanan",
          ekspedisi: "JNE",
          tanggalKirim: "2025-08-25",
          paket: "PAKET-UT-001",
          total: 120000,
          perjalanan: [
            { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGSEL" },
            { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: JAKSEL" },
            { waktu: "2025-08-26 08:44:01", keterangan: "Diteruskan ke Kantor Tujuan" }
          ]
        }
      }
};

// Vue app untuk pembuatan dan pencarian Delivery Order.
new Vue({
  el: "#trackingApp",
  data: {
    paket: dataSITTA.paket,
    trackingAwal: dataSITTA.tracking,
    pengirimanList: [
        { kode: "REG", nama: "Reguler (3-5 hari)" },
        { kode: "EXP", nama: "Ekspres (1-2 hari)" }
    ],
    doList: [],
    doDipilih: "",
    cariNama: "",
    pesanError: "",
    pesanSukses: "",
    form: {}
},
  created: function () {
    var self = this;
    Object.keys(this.trackingAwal).forEach(function (nomor) {
      var item = self.trackingAwal[nomor];
      var paket = self.paket.find(function (p) { return p.kode === item.paket; });
      self.doList.push({ nomor: nomor, nim: item.nim, nama: item.nama, status: item.status, ekspedisi: item.ekspedisi, tanggalKirim: item.tanggalKirim, kodePaket: item.paket, namaPaket: paket ? paket.nama : item.paket, total: item.total, perjalanan: item.perjalanan.map(function (p) { return Object.assign({}, p); }) });
    });
    this.resetForm(); this.doDipilih = this.doList.length ? this.doList[0].nomor : "";
  },
  computed: {
    paketTerpilih: function () { return this.paket.find(function (item) { return item.kode === this.form.kodePaket; }, this); },
    nomorBerikutnya: function () {
      var tahun = new Date().getFullYear(); var terbesar = 0;
      this.doList.forEach(function (item) { var cocok = item.nomor.match(/^DO(\d{4})-(\d+)$/); if (cocok && Number(cocok[1]) === tahun) terbesar = Math.max(terbesar, Number(cocok[2])); });
      return "DO" + tahun + "-" + String(terbesar + 1).padStart(3, "0");
    },
    doAktif: function () { return this.doList.find(function (item) { return item.nomor === this.doDipilih; }, this); },
    doTersaring: function () {
      var kata = this.cariNama.toLowerCase();
      return this.doList.filter(function (item) { return !kata || item.nama.toLowerCase().includes(kata) || item.nim.includes(kata); });
    }
  },
  watch: {
    "form.kodePaket": function () { this.pesanError = ""; this.pesanSukses = ""; },
    cariNama: function () { var hasil = this.doTersaring; if (hasil.length && !hasil.some(function (item) { return item.nomor === this.doDipilih; }, this)) this.doDipilih = hasil[0].nomor; },
    doDipilih: function (nomor) { if (nomor && !this.doList.some(function (item) { return item.nomor === nomor; })) this.doDipilih = ""; }
  },
  methods: {
    formatRupiah: function (angka) { return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka); },
    resetForm: function () { this.form = { nim: "", nama: "", ekspedisi: "", kodePaket: "", tanggalKirim: new Date().toISOString().slice(0, 10) }; this.pesanError = ""; this.pesanSukses = ""; },
    tambahDO: function () {
      this.pesanError = ""; this.pesanSukses = "";
      if (!/^[0-9]{9,12}$/.test(this.form.nim)) { this.pesanError = "NIM harus terdiri dari 9 sampai 12 digit angka."; return; }
      if (this.form.nama.trim().length < 3 || !this.form.ekspedisi || !this.form.kodePaket || !this.form.tanggalKirim) { this.pesanError = "Periksa kembali data. Semua kolom wajib harus diisi."; return; }
      var paket = this.paketTerpilih; if (!paket) { this.pesanError = "Pilih paket bahan ajar yang tersedia."; return; }
      var nomor = this.nomorBerikutnya;
      this.doList.push({ nomor: nomor, nim: this.form.nim, nama: this.form.nama.trim(), status: "Pesanan Dibuat", ekspedisi: this.form.ekspedisi, tanggalKirim: this.form.tanggalKirim, kodePaket: paket.kode, namaPaket: paket.nama, total: paket.harga, perjalanan: [{ waktu: new Date().toLocaleString("id-ID"), keterangan: "Delivery Order dibuat" }] });
      this.doDipilih = nomor; this.cariNama = ""; this.resetForm(); this.pesanSukses = "Delivery Order " + nomor + " berhasil ditambahkan.";
    }
  }
});
