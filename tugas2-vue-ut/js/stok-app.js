// Data dummy stok yang digunakan oleh halaman stok.html.
var dataSITTA = {
  upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
  kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],
  stok: [
        {
          kode: "EKMA4116",
          judul: "Pengantar Manajemen",
          kategori: "MK Wajib",
          upbjj: "Jakarta",
          lokasiRak: "R1-A3",
          harga: 65000,
          qty: 28,
          safety: 20,
          catatanHTML: "<em>Edisi 2024, cetak ulang</em>"
        },
        {
          kode: "EKMA4115",
          judul: "Pengantar Akuntansi",
          kategori: "MK Wajib",
          upbjj: "Jakarta",
          lokasiRak: "R1-A4",
          harga: 60000,
          qty: 7,
          safety: 15,
          catatanHTML: "<strong>Cover baru</strong>"
        },
        {
          kode: "BIOL4201",
          judul: "Biologi Umum (Praktikum)",
          kategori: "Praktikum",
          upbjj: "Surabaya",
          lokasiRak: "R3-B2",
          harga: 80000,
          qty: 12,
          safety: 10,
          catatanHTML: "Butuh <u>pendingin</u> untuk kit basah"
        },
        {
          kode: "FISIP4001",
          judul: "Dasar-Dasar Sosiologi",
          kategori: "MK Pilihan",
          upbjj: "Makassar",
          lokasiRak: "R2-C1",
          harga: 55000,
          qty: 2,
          safety: 8,
          catatanHTML: "Stok <i>menipis</i>, prioritaskan reorder"
        }
      ],
};

// Vue app untuk pengelolaan stok bahan ajar.
new Vue({
  el: "#app",
  data: {
    upbjjList: dataSITTA.upbjjList, kategoriList: dataSITTA.kategoriList,
    stok: dataSITTA.stok.map(function (item) { return Object.assign({}, item); }),
    filterUpbjj: "", filterKategori: "", filterStatus: "", sortBy: "judul", kataKunci: "",
    editKode: "", pesanError: "", pesanSukses: "", form: {}
  },
  created: function () { this.formBaru(); },
  computed: {
    kategoriTersedia: function () {
      var daerah = this.filterUpbjj; var stok = this.stok;
      return this.kategoriList.filter(function (kategori) {
        return !daerah || stok.some(function (item) { return item.upbjj === daerah && item.kategori === kategori; });
      });
    },
    filteredStok: function () {
      var self = this; var kata = this.kataKunci.toLowerCase();
      var hasil = this.stok.filter(function (item) {
        return (!self.filterUpbjj || item.upbjj === self.filterUpbjj) &&
          (!self.filterKategori || item.kategori === self.filterKategori) &&
          (!self.filterStatus || self.statusKey(item) === self.filterStatus) &&
          (!kata || item.kode.toLowerCase().includes(kata) || item.judul.toLowerCase().includes(kata));
      });
      return hasil.slice().sort(function (a, b) {
        if (self.sortBy === "qty") return a.qty - b.qty;
        if (self.sortBy === "harga") return a.harga - b.harga;
        return a.judul.localeCompare(b.judul, "id");
      });
    },
    jumlahAman: function () { return this.stok.filter(function (i) { return i.qty > 0 && i.qty >= i.safety; }).length; },
    jumlahMenipis: function () { return this.stok.filter(function (i) { return i.qty > 0 && i.qty < i.safety; }).length; },
    jumlahKosong: function () { return this.stok.filter(function (i) { return i.qty === 0; }).length; }
  },
  watch: {
    filterUpbjj: function () { this.filterKategori = ""; },
    filterKategori: function () { this.pesanSukses = ""; },
    kataKunci: function () { this.pesanSukses = ""; }
  },
  methods: {
    formatRupiah: function (angka) { return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka); },
    statusKey: function (item) { if (item.qty === 0) return "kosong"; if (item.qty < item.safety) return "menipis"; return "aman"; },
    statusLabel: function (item) { if (item.qty === 0) return "Kosong"; if (item.qty < item.safety) return "Menipis"; return "Aman"; },
    statusClass: function (item) { return "status-" + this.statusKey(item); },
    formBaru: function () { this.form = { kode: "", judul: "", kategori: "", upbjj: "", lokasiRak: "", qty: 0, safety: 0, harga: 0, catatan: "" }; },
    mulaiEdit: function (item) {
      this.editKode = item.kode;
      this.form = { kode: item.kode, judul: item.judul, kategori: item.kategori, upbjj: item.upbjj, lokasiRak: item.lokasiRak, qty: item.qty, safety: item.safety, harga: item.harga, catatan: item.catatanHTML.replace(/<[^>]*>/g, "") };
      this.pesanError = ""; this.pesanSukses = ""; window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    },
    batalEdit: function () { this.editKode = ""; this.formBaru(); this.pesanError = ""; this.pesanSukses = ""; },
    simpanData: function () {
      this.pesanError = ""; this.pesanSukses = "";
      if (!this.form.kode || !this.form.judul || !this.form.kategori || !this.form.upbjj || !this.form.lokasiRak) { this.pesanError = "Semua kolom wajib harus diisi."; return; }
      if (!Number.isInteger(this.form.qty) || !Number.isInteger(this.form.safety) || this.form.qty < 0 || this.form.safety < 0 || this.form.harga < 0) { this.pesanError = "Stok dan safety stock harus bilangan bulat nonnegatif; harga tidak boleh negatif."; return; }
      var kode = this.form.kode.trim().toUpperCase();
      if (this.stok.some(function (item) { return item.kode === kode && item.kode !== this.editKode; }, this)) { this.pesanError = "Kode mata kuliah sudah digunakan. Gunakan kode yang berbeda."; return; }
      var catatan = this.form.catatan.trim() ? this.escapeHTML(this.form.catatan.trim()) : "Tidak ada catatan";
      var dataBaru = { kode: kode, judul: this.form.judul.trim(), kategori: this.form.kategori, upbjj: this.form.upbjj, lokasiRak: this.form.lokasiRak.trim(), qty: Number(this.form.qty), safety: Number(this.form.safety), harga: Number(this.form.harga), catatanHTML: catatan };
      if (this.editKode) {
        var index = this.stok.findIndex(function (item) { return item.kode === this.editKode; }, this);
        if (index !== -1) this.$set(this.stok, index, dataBaru);
        this.pesanSukses = "Perubahan stok berhasil disimpan.";
      } else { this.stok.push(dataBaru); this.pesanSukses = "Data bahan ajar baru berhasil ditambahkan."; }
      this.editKode = ""; this.formBaru();
    },
    escapeHTML: function (teks) { return teks.replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]; }); },
    resetFilter: function () { this.filterUpbjj = ""; this.filterKategori = ""; this.filterStatus = ""; this.sortBy = "judul"; this.kataKunci = ""; this.pesanSukses = ""; }
  }
});
