const axios = require('axios')
const express = require('express')

// An api key is emailed to you when you sign up to a plan
// Get a free API key at https://api.the-odds-api.com/
const apiKey = 'c59ea39b68ed5173f548e8db3af664f2'

const sportKey = 'basketball_nba' // use the sport_key from the /sports endpoint below, or use 'upcoming' to see the next 8 games across all sports

const regions = 'us' // uk | us | eu | au. Multiple can be specified if comma delimited

const markets = 'h2h' // h2h | spreads | totals. Multiple can be specified if comma delimited

const oddsFormat = 'american' // decimal | american

const dateFormat = 'iso' // iso | unix

const app = express()

const getOdds = async (team) => {
    return await axios.get(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds`, {
        params: {
            apiKey,
            regions,
            markets,
            oddsFormat,
            dateFormat,
        }
    })
    .then(response => {
        for (const game of response.data) { 
            // If found the game that user is looking for...
            if (game["home_team"].includes(team) || game["away_team"].includes(team)) {
                for (const bookmaker of game["bookmakers"]) { 
                    if (bookmaker["key"] == "draftkings") {
                        let odds = {}
                        odds["team1"] = {}
                        odds["team1"]["name"] = bookmaker["markets"][0]["outcomes"][0]["name"]
                        odds["team1"]["odds"] = bookmaker["markets"][0]["outcomes"][0]["price"]
                        odds["team2"] = {}
                        odds["team2"]["name"] = bookmaker["markets"][0]["outcomes"][1]["name"]
                        odds["team2"]["odds"] = bookmaker["markets"][0]["outcomes"][1]["price"]
                        console.log(odds)
                        return odds
                    }
                };
            }
        }
        
        // Check your usage
        console.log('Remaining requests',response.headers['x-requests-remaining'])
        console.log('Used requests',response.headers['x-requests-used'])
        return {}
    })
    .catch(error => {
        //console.log('Error status', error.response.status)
        //console.log(error.response.data)
        console.log(error)
        return {}
    })
}

app.get('/odds/:team', async (req, res) => {
    const odds = await getOdds(req.params.team)
    console.log(odds);
    res.json(odds);
});

app.listen(process.env.PORT || 3000, function(err){
    if (err) console.log(err);
});