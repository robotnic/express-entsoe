# Express-entsoe

Easy to use json api for entso-e.

You can get the security token for free, by sending 
“Restful API access” to transparency@entsoe.eu 

https://transparency.entsoe.eu/content/static_content/download?path=/Static%20content/API-Token-Management.pdf

Usage:

```
app.use(Entsoe.init({
  securityToken:'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXXXXXX'
})
```