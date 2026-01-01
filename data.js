<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Details</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
body{
  margin:0;
  font-family:Inter,system-ui,sans-serif;
  background:#0b0b10;
  color:#fff;
}
.hero{
  height:60vh;
  background-size:cover;
  background-position:center;
  display:flex;
  align-items:flex-end;
}
.overlay{
  width:100%;
  padding:30px;
  background:linear-gradient(to top,#0b0b10 20%,transparent);
}
h1{margin:0;font-size:34px}
.meta{color:#aaa;margin-top:6px}
.desc{
  padding:30px;
  max-width:900px;
  line-height:1.6;
  font-size:16px;
}
.loading{
  text-align:center;
  padding:80px;
  color:#777;
}
</style>
</head>

<body>

<div id="app">
  <div class="loading">LOADING...</div>
</div>

<script src="data.js"></script>
<script>
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const item = DATA[id];

const app = document.getElementById("app");

if(!item){
  app.innerHTML = "<div class='loading'>NOT FOUND</div>";
}else{
  app.innerHTML = `
    <div class="hero" style="background-image:url('${item.poster}')">
      <div class="overlay">
        <h1>${item.title}</h1>
        <div class="meta">${item.year} · ${item.type}</div>
      </div>
    </div>

    <div class="desc">
      ${item.description}
    </div>
  `;
}
</script>

</body>
</html>
