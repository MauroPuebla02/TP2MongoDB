import axios from 'axios';
import {connection} from '../basedatos/basedatos';
import { Db, MongoClient } from "mongodb";



async function llenarBase() {
    const { db, client } = await connection();
  
    for (let code = 1; code <= 300; code++) {
      const codigo = code.toString().padStart(3, '0');
      const pais = await fetchPais(codigo);
      if (pais) {
        await buscador(pais, code, db); // pasás la instancia de db si la usás
      } else {
        console.log(`Código ${codigo} no encontrado.`);
      }
    }
  
    await client.close(); // 👈 Esto cierra la conexión
    console.log("✅ Conexión a Mongo cerrada");
  };

async function buscador(pais: any , code: number, db: Db){
    const codigoPais = code;
    const nombrePais = pais?.name?.common ?? '';
    const capital = pais?.capital?.[0] ?? '';
    const region = pais?.region ?? '';
    const poblacion = pais?.population ?? 0;
    const latitud = pais?.latlng?.[0] ?? 0;
    const longitud = pais?.latlng?.[1] ?? 0;
    const superficie = pais?.area ?? 0;
    const p ={
        codigoPais:codigoPais,
        nombrePais:nombrePais,
        capital:capital,
        region:region,
        poblacion:poblacion,
        latitud:latitud,
        longitud:longitud,
        superficie:superficie
    };
    const rows = await db.collection("paises").findOne({ codigoPais: codigoPais });

    if (rows) {
       await db.collection("paises").updateOne({"codigoPais": rows.codigoPais} ,{$set : p});         
       console.log(`Actualizado código ${p}`);
    } else {
        await db.collection("paises").insertOne(p);
        console.log(`Creado código ${p}`);
    }
};


async function fetchPais(code: string) {
    try {
      const response = await axios.get(`https://restcountries.com/v3.1/alpha/${code}`);
      return response.data[0];
    } catch (error) {
      return null;
    }
};

async function buscarPorRegion(region: string){    
    const { db, client } = await connection();
    if(region){
        const paises = await db.collection("paises").find({"region": region}).toArray(); 
        if(paises){           
            mostrarPaises(paises);
        }else{
            console.log("No se encontraron paises en la region indicada (" + region + ").");
        }        
    }
    else{
        console.log("No indico una region.");
    }
    // Esto cierra la conexión
    await client.close();
    console.log("✅ Conexión a Mongo cerrada");
};

function mostrarPaises(paises: any[]) {
    if (paises && paises.length > 0) {
      paises.forEach(p => {
        console.log(`País: ${p.nombrePais} - Código: ${p.codigoPais} - Región: ${p.region} - Poblacion: ${p.poblacion}`);
      });
    } else {
      console.log("No hay países para mostrar.");
    }
  };

  async function buscarPorRegionYPoblacion(region: string, poblacion : number){    
    const { db, client } = await connection();
    if(region){
        const paises = await db.collection("paises").find({"region": region, "poblacion":{$gte: poblacion}}).toArray(); 
        if(paises){           
            mostrarPaises(paises);
        }else{
            console.log("No se encontraron paises en la region indicada (" + region + ").");
        }        
    }
    else{
        console.log("No indico una region.");
    }
    // Esto cierra la conexión
    await client.close();
    console.log("✅ Conexión a Mongo cerrada");
};

async function buscarPorNoRegion(region: string){    
    const { db, client } = await connection();
    if(region){
        const paises = await db.collection("paises").find({"region": {$ne:region}}).toArray(); 
        if(paises){           
            mostrarPaises(paises);
        }else{
            console.log("No se encontraron paises en la region indicada (" + region + ").");
        }        
    }
    else{
        console.log("No indico una region.");
    }
    // Esto cierra la conexión
    await client.close();
    console.log("✅ Conexión a Mongo cerrada");
};

type Pais = {
    nombrePais: string;
    poblacion: number;
  };

async function actualizaNombrePaisYPoblacion(pais : string, p: Pais){
    const { db, client } = await connection(); 
    const result = await db.collection("paises").findOne({"nombrePais": pais});

    if(result){
        await db.collection("paises").updateOne({"nombrePais": pais} ,{$set : p});     
        const busca = await db.collection("paises").find({"nombrePais": p.nombrePais}).toArray();
        mostrarPaises(busca);
    }else{
        console.log("El pais que intenta actualizar no posee un registro en la base de datos:");
    }
    // Esto cierra la conexión
    await client.close();
    console.log("✅ Conexión a Mongo cerrada");
}

async function eliminarPaisPorCodigo(code : number){
    const { db, client } = await connection(); 
    const result = await db.collection("paises").findOne({"codigoPais": code});
    if(result){
        await db.collection("paises").deleteOne({"codigoPais": code});     
        console.log(`El país: ${result.nombrePais} con código: ${code} fue eliminado correctamente`);
    }else{
        console.log("El código de país ingresado no posee un registro en la base de datos:");
    }
    // Esto cierra la conexión
    await client.close();
    console.log("✅ Conexión a Mongo cerrada");
}
// ----------------------------  Version mejorada   ------------------------------------------
/* 
    async function eliminarPaisPorCodigo(code: number) {
        const { db, client } = await connection();
    
        const resultado = await db.collection("paises").findOneAndDelete({ codigoPais: code });
    
        if (resultado.value) {
        console.log(`✅ El país: ${resultado.value.nombrePais} con código ${code} fue eliminado correctamente.`);
        } else {
        console.log("❌ El código ingresado no corresponde a ningún país en la base de datos.");
        }    
        await client.close();
        console.log("✅ Conexión a Mongo cerrada");
  }
*/

async function buscarPaisesEntrePoblacion(min : number, max:number){
    if(max > min){
        const { db, client } = await connection(); 
        const result = await db.collection("paises").find({"poblacion":{$gte: min, $lte:max}}).toArray();
        if(result){        
            console.log(`Los país encontrado con la poblacion entre  ${min} y ${max} son:`);
            mostrarPaises(result);
        }else{
            console.log("No se encontraron paises que cumplan la población especificadad");
        }
        // Esto cierra la conexión
        await client.close();        
        console.log("✅ Conexión a Mongo cerrada");
    }else{
        console.log(`El valor minimo (${min}) debe ser mayor que el valor maximo ${max}`)
    }
}
async function buscarPaisesPorNombre(name : string){
    if(name.length> 0){
        const { db, client } = await connection(); 
        const result = await db.collection("paises").find({"nombrePais": name}).sort({"nombrePais" : -1}).toArray();
        if(result){        
            console.log(`Los país encontrado son:`);
            mostrarPaises(result);
        }else{
            console.log("No se encontraron paises que cumplan la población especificadad");
        }
        // Esto cierra la conexión
        await client.close();        
        console.log("✅ Conexión a Mongo cerrada");
    }else{
        console.log(`El valor inresado no puede ser vacio`)
    }
}
async function buscarTodosSalteandoXCantidad(cant : number){
    if(cant > 0){
        const { db, client } = await connection(); 
        const result = await db.collection("paises").find().skip(cant).toArray();
        if(result){        
            console.log(`Los país encontrado son:`);
            mostrarPaises(result);
        }else{
            console.log("No se encontraron paises que cumplan la población especificadad");
        }
        // Esto cierra la conexión
        await client.close();        
        console.log("✅ Conexión a Mongo cerrada");
    }else{
        console.log(`El valor inresado no puede ser menor a cero (0)`)
    }
}

async function buscarPaisesQueContenga(busqueda : string){
    if(busqueda.length> 0){
        const { db, client } = await connection(); 
        const result = await db.collection("paises").find({ "nombrePais": { $regex: busqueda, $options: "i" } }).toArray();   
        if(result){        
            console.log(`Los país encontrado son:`);
            mostrarPaises(result);
        }else{
            console.log("No se encontraron paises que cumplan la población especificadad");
        }
        // Esto cierra la conexión
        await client.close();        
        console.log("✅ Conexión a Mongo cerrada");
    }else{
        console.log(`El valor inresado no puede ser vacio`)
    }
}

async function crearIndice(campo : string){
    if(campo.length> 0){
        const { db, client } = await connection(); 
        const result = await db.collection("paises").createIndex({ campo: 1 });   
        if(result){        
            console.log(`Indice creado con exito`);
        }else{
            console.log("no se creo el indice especificado");
        }
        // Esto cierra la conexión
        await client.close();        
        console.log("✅ Conexión a Mongo cerrada");
    }else{
        console.log(`El valor inresado no puede ser vacio`)
    }
}

// llenarBase();

//  buscarPorRegion("Americas"); 

//buscarPorRegionYPoblacion("Americas",100000000);

//  buscarPorNoRegion("Africa");

// actualizaNombrePaisYPoblacion("Albania",{nombrePais: "Egipto",poblacion: 95000000});

// eliminarPaisPorCodigo(258);

 //  buscarPaisesEntrePoblacion(50000000,150000000);

//  buscarPaisesPorNombre("Argentina");

// buscarTodosSalteandoXCantidad(80);

//  buscarPaisesQueContenga("ar");

// crearIndice("codigoPais");
