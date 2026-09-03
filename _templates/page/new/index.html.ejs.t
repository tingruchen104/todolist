---
to: 'templates/<%=workspace%>/index.html'
---
<!DOCTYPE html>
<html lang='en'>
  <head>
      <%%- include('templates/include/head/utility.html') %%>
      <%%- include('templates/include/head/dns.html') %%>
      <title><%%= title['<%= chunkname %>'] %%></title>
      <%%- include('templates/include/head/category-picker.html') %%>
      <%%- include('templates/include/head/designer-icons.html') %%>
      <%%- include('templates/include/head/font.html') %%>
  </head>
  <body>
    <%%- include('templates/include/html/noscript.html') %%>
    <div id='app'></div>
    <script type='module' src='/src/pages/<%= workspace %>/index.js'></script>
  </body>
</html>
