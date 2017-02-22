//importing modules
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );

//creating a new express server
var app = express();

//setting EJS as the templating engine
app.set( 'view engine', 'ejs' );

//setting the 'assets' directory as our static assets dir (css, js, img, etc...)
app.use( '/assets', express.static( 'assets' ) );



//Schéma JSON to stock the values of LBC ad Meilleur Agent 
var data = {
    title: "Example Schema",
    price: 0,
    surface: 0,
    type: "",
    city: '',
    zipCode: 0,
    priceMSquare: 0,
};

var dataMA = {
    meanPriceMA: 0,
    conclusion: "",
}


//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
app.get( '/', function ( req, res ) {

    var url = req.query.urlLBC

    request( url, function ( error, response, body ) {
        if ( !error && response.statusCode == 200 ) {

            var $ = cheerio.load( body )

            // if there are no mistakes in the request, we stock the values in data
            data = {
                price: parseInt( $( lbcDataArray.get( 0 ) ).text().replace( /\s/g, '' ), 10 ),
                city: $( lbcDataArray.get( 1 ) ).text().trim().toLowerCase().replace( /\_|\s/g, '-' ).split( ' ' )[0],
                zipCode: $( lbcDataArray.get( 1 ) ).text().trim().toLowerCase().replace( /\_|\s/g, '-' ).split( ' ' )[1],
                type: $( lbcDataArray.get( 2 ) ).text().trim().toLowerCase(),
                surface: parseInt( $( lbcDataArray.get( 4 ) ).text().replace( /\s/g, '' ), 10 ),
                priceMSquare: prix / surface

            }
        }
        else {
            console.log( error )
        }
    })

    request( 'https://www.meilleursagents.com/prix-immobilier/' + data.city.toLowerCase() + '-' + data.codePostal, function ( error, response, body ) {
        if ( !error && response.statusCode == 200 ) {

            const $ = cheerio.load( body )

            // we are looking for the mean ^rice for the good type of goods
            if ( data.type = "MAISON" ) {
                dataMA = {
                    meanPriceMA: parseInt( $( lmaDataArray.get( 0 ) ).text().replace( /\s/g, '' ), 10 ),
                }
            }
            if ( data.type = "APPARTEMENT" ) {
                dataMA = {
                    meanPriceMA: parseInt( $( lmaDataArray.get( 1 ) ).text().trim().toLowerCase().replace( /\_|\s/g, '-' ) ),
                }
            }
            if ( data.type = "LOCATION" ) {
                dataMA = {
                    meanPriceMA: parseInt( $( lmaDataArray.get( 2 ) ).text().trim().toLowerCase() ),
                }
            }

            // we compare the values staocker in data and dataMA to find if it's a good deal or not
            if ( data.priceMSquare < dataMA.meanPriceMA ) {
                dataMA.conclusion = "C'est une bonne affaire ! Renseignez-vous !"
            }
            else {
                dataMA.conclusion = "Ce n'est pas une bonne affaire !"
            }
        }


        else {
            console.log( error )
        }

        // We print in the home page all the data and the conclusion of the comparison        
        res.render( 'home', {
            message2: data.price,
            message3: data.city,
            message4: data.zipCode,
            message5: data.type,
            message6: data.surface,
            message7: dataMa.meanPriceMA,
            message8: dataMa.conclusion,
        });
    })
});


//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});
