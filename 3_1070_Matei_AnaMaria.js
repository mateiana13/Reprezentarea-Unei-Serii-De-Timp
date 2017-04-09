//desenarea unui bar chart/histograma
function deseneazaHistograma(){

	var selects = document.getElementById("tara");									//preiau elementul din pagina identificat prin id-ul "tara"
	var selectedValue = selects.options[selects.selectedIndex].value;				//preiau tara selectata de user

	var selectori = document.getElementById("caracteristica");						//preiau elementul din pagina identificat prin id-ul "caracteristica"
	var valoriSelectate = selectori.options[selectori.selectedIndex].value;			//preiau caracteristica selectata de user


	var width = 1200, height = 500, padding = 100;									//initializez width, height, padding pentru elementul svg

	var colorScale = d3.scale.category20();											//in colorScale retin o scala de culori predefinita a bibliotecii d3js

	d3.json("media/date.json",function(data){										//citirea datelor din fisier JSON
		
		if(valoriSelectate==0){														//pentru caracteristica 0(populatie)
			var map = data[selectedValue].populatie.map(function(i){ return i[1]});	//in map tin populatia corespunzatoare tarii preluata prin selectedValue si returneaz valorile acesteia pentru cei 30 de ani
		}
		if(valoriSelectate==1){														//pentru caracteristica 1(PIB)
			var map = data[selectedValue].PIB.map(function(i){ return i[1]});		//in map tin PIB-ul corespunzator tarii preluata prin selectedValue si returneaza valorile acestora pentru cei 30 de ani
		}
		if(valoriSelectate==2){														//pentru caracteristica 2(speranta_de_viata) 
			var map = data[selectedValue].speranta_de_viata.map(function(i){ return i[1]});	//in map tin SV corespunzatoare tarii preluata in selectedValue si returnez valorile acesteia pentru cei 30 de ani
		}

		histogram = d3.layout.histogram()											//aplic layout-ul de histograma implementat in d3js
			.bins(7)																//bins=numarul de intervale pe care le voi reprezenta in histograma
			(map)																	//cuprinde informatiile pe care le reprezentam

		var yScale = d3.scale.linear()												//creez o scala liniara pentru axa OY
			.domain([0,d3.max(histogram.map(function(i){							//domeniul de valori este de la 0 la nr de valori 
				return i.length;
			}))])
			.range([0,height]);														//intervalul este de la 0 la height=500

		var xScale = d3.scale.linear()												//creez o scala liniara pt axa OX
			.domain([0,d3.max(map)])												//domeniul este de la 0 la valoarea maxima continuta in map
			.range([0,width]);														//intervalul de la 0 la width=500

		var xAxis = d3.svg.axis()													//initializare axa OX
			.scale(xScale)															//scala de valori este xScale
			.orient("bottom")														//orientare in partea de jos a paginii
			.ticks(20);																//numarul de gradatii care apar pe axa: 20

		var svg = d3.select("#svgVisualize")										//in svg selectez elementul cu id-ul svgVisualize
			.attr("width",  width)													//svg-ului ii atribui o latimea egala cu width
			.attr("height",  height+padding);										//svg-ului ii atribui o inaltime egala cu height+padding
																					//(adun un pading de 100 pt ca histograma sa nu apara lipita de partea de jos a svg-ului; 
																					//ofera o mai buna vizualizare; este o proprietate CSS)


		svg.selectAll("*").remove();												// goloim SVG-ul

		var group = svg.append("g")													//grupez toate elementele de pe svg intr-un grup prin tag-ul "g"
			.attr("transform","translate(0,"+height+")")							//initial axa OX va fi reprezentata in partea de sus a svg-ului;
																					//pentru a aduce axa OX in partea de jos a svg-ului se impune o transformare de tip translatie din pozitia 0 in pozitia height
			.call(xAxis);															//adaug la svg axa OX
		
		var bars = svg.selectAll(".bar")											//returneaza toata elementele selectate din clasa "bar"
			.data(histogram)														//in data se specifica elementul din care se preiau datele(histogram; sunt stocate in map), si se atribuie niste chei elementelor(indici)
			.enter()																//enter.append("g") creeaza atat de multe grupuri egale cu numarul de chei din histogram										
			.append("g")


		bars.append("rect")															//pe fiecare bars pun un element de tip rectangle
			.transition().duration(3000)											//desenarea fiecarui dreptunghi se face pe o durata de 3000 milisecunde
			.delay(function(d,i){return i * 200;})									//aplic o intarzaiere desenarii barelor(masurata in milisecunde) 
			.attr("x",function(d){ return xScale(d.x); })							//x=pozitia de unde incepe sa deseneze barele
			.attr("y",function(d){ return 500 - yScale(d.y); })						//functie care imi pozitioneaza dreptunghiurile in partea de jos a graficului, lipite pe axa OX
			.attr("width",function(d){ return xScale(d.dx); })						//dx=range-ul, latimea barei(valorile dx ale fiecarui interval sunt extrem de apropiate)
			.attr("height",function(d){ return yScale(d.y); })						//y tine nr de elemente din interval
			.attr("fill",function(d){return colorScale(d);})						//aplic fiecarei bare/dreptunghi o culoare din scala aleasa
																					//am folosit xScale si yScale pentru ca latimea si inaltimea barelor sa fie proportionala cu valorile mele


		bars.append("text")															//pe fiecare bara pun text
			.attr("x",function(d){return xScale(d.x);})								
			.attr("y",function(d){return 500 - yScale(d.y);})							
			.attr("dy","25px")														//textul este pozitionat la 25px sub parte de sus a fiecarui dreptunghi
			.attr("dx",function(d){return xScale(d.dx)/2;})							//atasez textul la jumatatea barei pentru a fi mai vizibil
			.attr("fill","#000000")													//afizez textul "in plin" si culoarea alb
			.attr("text-anchor","middle")											//aliniaza textul la mijloc relativ la pozitia xScale(d.dx)/2
			.text(function(d){return d.y;});										//valoarea d.y reprezinta numarul de elemente din intervalul corespunzator fiecarui dreptunghi; aceste numere vor fi afisate pe dreptunghiuri

	});	
}

















//2) bubbleChart 

var tara = [];
var continent = [];
var populatie = [];
var PIB = [];
var speranta_de_viata = [];

var height = 500; var width = 1200;

var svgns = "http://www.w3.org/2000/svg";

var coordonate = [];
var histogram;

$(function(){
	InitChart();	 	/*functie de initializare chart*/

	getCoordinates();

	arataAn();

});

/*crearea graficului*/
function InitChart() {
  var vis = d3.select("#mySVG");
  vis.style("border","1px solid #000000");
  var xRange = d3.scale.linear().range([20, 480]).domain([0,300]);
  var yRange = d3.scale.linear().range([480, 10]).domain([0,300]);
  var xAxis = d3.svg.axis().scale(xRange);
  var yAxis = d3.svg.axis().scale(yRange).orient("left");
  vis.append("svg:g").call(xAxis).attr("transform", "translate(0,480)");
  vis.append("svg:g").call(yAxis).attr("transform", "translate(20,0)");

}



/*extrag datele din fisierul json din json*/
$.getJSON("media/date.json",function(data){

    $.each(data, function(i, field) {
    	tara.push(field.tara);
    	continent.push(field.continent);
    	populatie.push(field.populatie);
    	PIB.push(field.PIB);
    	speranta_de_viata.push(field.speranta_de_viata);
     });
});


/*obtin  o lista cu 93 de elemente de forma [an, PIB/loc, sperantaViata, populatie]*/
function getCoordinates(){
	for (var i = 0; i <populatie.length; i++) {
		for(var j = 0; j < populatie[i].length; j++){
			var temp = [populatie[i][j][0] ,PIB[i][j][1]/populatie[i][j][1], speranta_de_viata[i][j][1], populatie[i][j][1]];
			coordonate.push(temp);			
		}
	};
};


//pentru un anumit an vreau sa pun pe grafic o bila de care sa corespunda (PIB/locuitor, sperantaViata); raza bilei este data de populatie
function arataAn(an){																	//functie care deseneaza 3 bile in functie de valorile coresp celor 3 tari in anul respectiv

	stergeObiect();																		//sterg svg-ul la fiecare redesenare

	for(var i = 0; i < coordonate.length; i ++){

		if(coordonate[i][0] == an){														//daca anul retinut in coordonate[i][0] este egal cu anul din paragraf(p)

			var t = (coordonate[i][3])/10;												//t = populatia corespunzatoare acelui an(impart la 10 pentru a nu desena bile prea mari)

			if(i <= 30){																//cat timp nu am ajuns la sfarsitul intervalului de 31 de ani pentru Romania(primul obiect JSON)
				
				addBubbleRO(coordonate[i][1], height - coordonate[i][2], t+5);			//desenez o bila coresp Romaniei; 
																						//pozitia de OX este data de PIB/loc(cx)
																						//si cea de pe OY(cy) este date de speranta de viata(scad din height pt a desena bila in parte de jos a svg-ului)
																						//raza(r) este pop/10+5
			}
			else{
				if(i <= 61){																//elementele de la pozitia 31 pana la 61 corespund Chinei(al doilea obiect JSON)
					
					addBubbleCH(coordonate[i][1], height - coordonate[i][2], t+5);		//desenez bila pentru China

				}
				else{																	//de la pozitia 62 si pana la sfarsitul vectorului am datele corespunzatoare Algeriei
					
					addBubbleAL(coordonate[i][1], height - coordonate[i][2], t+5);		//desenez bila pt Algeria
				}
			}
		}
	}
};


function populeazaGrafic(){																//functie de populare a graficului cu toate cele 93 de valori

	stergeObiect();																		//golesc svg-ul

	for(var i = 0; i < coordonate.length; i ++){										//pentru toate elementele din vectorul coordonate(datele pt cei 31 de ani coresp fiecarei tari)
		
			var t = (coordonate[i][3])/10;

			if(i<=30){

				addBubbleRO(coordonate[i][1], height -coordonate[i][2], t+5);			//desenez bila coresp Romaniei
			}
			else{
				if(i<=61){
			
					addBubbleCH(coordonate[i][1], height -coordonate[i][2], t+5);		//desenez bila coresp Chinei
				}
				else{
					
					addBubbleAL(coordonate[i][1], height -coordonate[i][2], t+5);		//desenez bila coresp Algeriei
				}
			}
			//addBubbleRO(coordonate[i][2], coordonate[i][1], t+5);
		
	}
};

function stergeObiect(){																//functie de stergere a svg-ului 
	$('circle').remove('.Romania');														//sterge cercurile/bilele cu clasa "Romania"
	$('circle').remove('.China');														//sterge cercurile/bilele cu clasa "China"
	$('circle').remove('.Algeria');														//sterge cercurile/bilele cu clasa "Algeria"
}


function nextAn(){																		//functie care incrementeaza valoarea anului retinut in "p" la apasarea butonului next
	var year = parseInt(document.getElementById("anul").innerHTML);						//se selecteaza elementul cu id-ul "anul"
	year ++;																			//incrementez valoarea anului
	if(year <= 2010){																	//conditionez anul afisat la apasarea butonului next a.i. sa nu iasa din intervalul considerat
		document.getElementById("anul").innerHTML = year;								//elementului de id "anul" ii dau valoarea nou calculata
		arataAn(year);																	//apelez functia care afiseaza cele 3 bile coresp situatiei din anul respectiv a celor 3 tari 
	}
};

function prevAn(){																		//functie care decrementeaza valoarea anului retinut in "p" la apasarea butonului prev
	var year = parseInt(document.getElementById("anul").innerHTML);						//se selecteaza elementul cu id-ul "anul"
	year --;																			//decrementez valoarea anului
	if(year >= 1980){																	//conditionez anul afisat la apasarea butonului prev a.i. sa nu iasa din intervalul considerat
		document.getElementById("anul").innerHTML = year;								//elementului de id "anul" ii dau valoarea nou calculata
		arataAn(year);																	//apelez functia care afiseaza cele 3 bile coresp situatiei din anul respectiv a celor 3 tari 
	}
};














//3) animatia
function arataAnAnimatie(an){															
	for(var i = 0; i < coordonate.length; i ++){
		if(coordonate[i][0] == an){
			var t = (coordonate[i][3])/10;
			if(i <= 30){
				startAnimatie(coordonate[i][1], height - coordonate[i][2], t+5);			//pornesc animatia doar pt bila coresp Romaniei 
			}
			
		
		}
	}
}

function nextAnim(){																	//functie care animeaza bila coresp anului urmator
	var year = parseInt(document.getElementById("anul").innerHTML);
	year ++;
	if(year <= 2010){
		document.getElementById("anul").innerHTML = year;
		arataAnAnimatie(year);
	}
};

function prevAnim(){																	//functie care animeaza bila coresp anului precedent
	var year = parseInt(document.getElementById("anul").innerHTML);
	year --;
	if(year >= 1980){
		document.getElementById("anul").innerHTML = year;
		arataAnAnimatie(year);
	}
};


function startAnimatie(cx,cy,r){														//functia care realizeaza deplasarea 						
	var cerc=document.getElementById('ro');												//in cerc preiau elementele cu id-ul "ro"

	if(cerc!=null){																		//daca exista elem cu id "ro"

		var x = parseFloat(cerc.getAttribute('cx'));									//retin coordonata pe OX a cercului
		var y = parseFloat(cerc.getAttribute('cy'));									//retin coordonata pe OY a cercului
		var pas = parseFloat(1/10);														//creez o variabila pas cu o zecimala(0.1)
		x.toFixed(2);																	//vreau ca x sa aiba fix 2 zecimale
		y.toFixed(2);																	//vreau ca y sa aiba fix 2 zecimale

		var intId = setInterval(function(){												//redeseneaza cercul la fiecare 0 sec(redesenez cercul incrementand/decrementand valorile pe OX si OY 
																						//pana cand acestea devin egale cu pozitia coresp cercului din urmatorul an)
			if(cx == parseFloat(cerc.getAttribute('cx'))){
				if(cy == parseFloat(cerc.getAttribute('cy'))){
					clearInterval(intId);												//sterg intervalul intId setat cu setInterval()
				}
			}

			if(cx < x){
				if(cy < y){
					x -= pas;
					y -= pas;
					cerc.setAttribute('cx',x);
					cerc.setAttribute('cy',y);
				}
				else{
					x -= pas;
					y += pas;
					cerc.setAttribute('cx',x);
					cerc.setAttribute('cy',y);
				}
			}
			else{
				if(cy < y){
					x += pas;
					y -= pas;
					cerc.setAttribute('cx',x);
					cerc.setAttribute('cy',y);
				}
				else{
					x += pas;
					y += pas;
					cerc.setAttribute('cx',x);
					cerc.setAttribute('cy',y);
				}
			}
		},0)
	}
	else{
		addBubbleRO(cx, cy, r);
	}
}


function addBubbleRO(cx,cy,r){															//functia de desenare a cercului/bilei coresp Romaniei
	var cerc = document.createElementNS(svgns,"circle");								//creez un element de tip "circle"
	cerc.setAttributeNS(null, "id", "ro");												//ii setez id-ul "ro"
	cerc.setAttributeNS(null, "class", "Romania");										//ii setez clasa "Romania"
	cerc.setAttributeNS(null, "cx", cx);												//ii setez atributul "cx" in care o sa gestionez pozitia pe OX de unde incepe desenarea cercului
	cerc.setAttributeNS(null, "cy", cy);												//ii setez atributul "cy" in care o sa gestionez pozitia pe OY de unde incepe desenarea cercului
	cerc.setAttributeNS(null, "r", r);													//ii setez atributul "r" care reprezinta raza cercului
	cerc.setAttributeNS(null, "fill", "#00AD00");										//cercul va fi umplut cu culoarea verde
	document.getElementById("mySVG").appendChild(cerc);									//pun elementul pe svg(este un copil al svg-ului)
};

function addBubbleCH(cx,cy,r){															//functia de desenare a cercului/bilei coresp Chinei
	var cerc = document.createElementNS(svgns,"circle");								//creez un element de tip "circle"
	cerc.setAttributeNS(null, "id", "ch");												//ii setez id-ul "ch"
	cerc.setAttributeNS(null, "class", "China");										//ii setez clasa "China"
	cerc.setAttributeNS(null, "cx", cx);												//ii setez atributul "cx" in care o sa gestionez pozitia pe OX de unde incepe desenarea cercului
	cerc.setAttributeNS(null, "cy", cy);												//ii setez atributul "cy" in care o sa gestionez pozitia pe OY de unde incepe desenarea cercului
	cerc.setAttributeNS(null, "r",r);													//ii setez atributul "r" care reprezinta raza cercului
	cerc.setAttributeNS(null, "fill", "magenta");										//cercul va fi umplut cu culoarea magenta
	document.getElementById("mySVG").appendChild(cerc);									//pun elementul pe svg(este un copil al svg-ului)
};

function addBubbleAL(cx,cy,r){															//functia de desenare a cercului/bilei coresp Algeriei
	var cerc = document.createElementNS(svgns,"circle");								//creez un element de tip "circle"
	cerc.setAttributeNS(null, "id", "al");												//ii setez id-ul "al"
	cerc.setAttributeNS(null, "class", "Algeria");										//ii setez clasa "Algeria"
	cerc.setAttributeNS(null, "cx", cx);												//ii setez atributul "cx" in care o sa gestionez pozitia pe OX de unde incepe desenarea cercului
	cerc.setAttributeNS(null, "cy", cy);												//ii setez atributul "cy" in care o sa gestionez pozitia pe OY de unde incepe desenarea cercului
	cerc.setAttributeNS(null, "r",r);													//ii setez atributul "r" care reprezinta raza cercului
	cerc.setAttributeNS(null, "fill", "steelblue");										//cercul va fi umplut cu culoarea albastru
	document.getElementById("mySVG").appendChild(cerc);									//pun elementul pe svg(este un copil al svg-ului)
};















//4) tabelul dupa ani 
function deseneazaTabel(){															//functie care afiseaza datele coresp celor 3 tari pt un interval de timp ales de user

  d3.json('media/date3.json', function (data) {										//citirea datelor din fisierul JSON					

    var select1 = document.getElementById("an1");									//preluarea elem cu id "an1"
    var an1 = parseInt(select1.options[select1.selectedIndex].text);				//selectarea valorii coresp anului cu id "an1"
    var select2 = document.getElementById("an2");									//preluarea elem cu id "an2"
    var an2 = parseInt(select2.options[select2.selectedIndex].text);				//selectarea valorii coresp anului cu id "an2"

    informatie = data.filter(function(val){											//in informatie retin datele din JSON filtrate dupa cei doi ani
        return val.an >= an1 && val.an <= an2;										//sunt returnate doar valorile cuprinse in intervalul [an1, an2] ales de user
    });

    function tabulate(informatie, columns) {										//functie de desenare a unui tabel continand informatie si dupa numele coloanelor(columns)
    	
    	var oldtable=document.getElementById('mytable');							//se selecteaza in oldtable elemtul cu id "mytable"
    	
    	if(oldtable!=null){															//daca exista deja un astfel de element
    		$('#mytable').remove();													//acesta este sters
    	}

        var table = d3.select('body').append('table');								//pe body se pune un element de tip "table"
        var thead = table.append('thead');											//tabelului ii adaug un element "thead"
        var tbody = table.append('tbody');											//tabelului ii adaug un element "tbody"

        table.attr("id","mytable");													//tabelului ii atribui id-ul "mytable"

        // append the header row
        thead.append('tr')															
          .selectAll('th')															//la thead apendam tag-ul "tr"
          .data(columns)															//apoi luam toate coloanele pe care le avem in functie
          .enter()																	//si le adaugam la rand folosind tag-ul "th"
          .append('th')																
            .text(function (column) { return column; });							

        // create a row for each object in the data
        var rows = tbody.selectAll('tr')											//la fiecare rand adauga un tag "tr" de fiecare data cand e apelata functia
          .data(informatie)															
          .enter()																	
          .append('tr');															

        // create a cell in each row for each column
        var cells = rows.selectAll('td')											//selectam fiecare rand pe care l-am adaugat
          .data(function (row) {
            return columns.map(function (column) {									
              return {column: column, value: row[column]};							//intersectia informatiei aflate la linie si coloana(celula)
            });
          })
          .enter()
          .append('td')
            .text(function (d) { return d.value; });								//ia datele si le pune in celula corespunzatoare din HTML

      return table;
    }

    // render the table
    tabulate(informatie, ['tara', 'an', 'PIB', 'populatie', 'SV']); 				//deseaza tabelul cu datele preluate din Json si care are 5 coloane: tara, an, Pib, pop, SV

});


}

