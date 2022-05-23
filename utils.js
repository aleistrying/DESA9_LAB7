const config = require('./config.json');
const axios = require("axios").default

const getFormattedBackendUrl = ({ query, searchType }) => {
    return `${config.pokeapiUrl}/${searchType}/${query}`;
};
const fetch = async ({ url, searchType }) => {
    try {
        const rawResponse = await axios(url);
        if (rawResponse.status !== 200) {
            throw new Error(`${searchType} not found`);
        }
        return rawResponse.data
    } catch (error) {
        throw error;
    }
};
const getAbility = ({ nameOrId }) => {
    const searchType = "ability";
    return fetch({
        url: getFormattedBackendUrl({ query: nameOrId.replace(" ", "-"), searchType }),
        searchType,
    });
};
const getPokemon = async ({ nameOrId }) => {
    const searchType = "pokemon";
    try {
        const speciesResponse = await fetch({
            url: getFormattedBackendUrl({
                query: nameOrId,
                searchType: "pokemon-species"
            }),
            searchType: "pokemon-species",
        });
        //from species, get evolution chain
        const [response, chain] = await Promise.all([
            fetch({
                url: getFormattedBackendUrl({
                    query: nameOrId,
                    searchType,
                }),
                searchType,
            }),
            fetch({
                url: speciesResponse?.evolution_chain?.url,
                searchType: "evolution-chain",
            }).catch((e) => {
                console.log("No chain found for species found for this pokemon");
                return {};
            })
        ]);
        if (chain?.chain)
            response.evolutionChain = deconstructPokemonChain({
                initialPokemon: chain?.chain
            })
        return response;
    } catch (e) {
        // console.log(e)
        throw new Error(`No pokemon found`);
    }
};


// pokemon: { evolves_to:[pokemon,pokemon,pokemon], species:{}}
const deconstructPokemonChain = ({ initialPokemon }) => {

    //closing condition
    if (!initialPokemon.evolves_to?.length)
        return {
            name: initialPokemon.species.name,
            isBaby: initialPokemon.is_baby
        };

    return [{
        name: initialPokemon.species.name,
        isBaby: initialPokemon.is_baby
    },
    ...initialPokemon.evolves_to.map(pokemon => {
        let pokemons = deconstructPokemonChain({
            initialPokemon: pokemon
        })

        //if it's an array flat it
        if (pokemons?.length)
            return pokemons.flat();

        return pokemons
    })].flat()
};

const capitalize = (s) => {
    if (!s || typeof s !== "string") return s;
    return s.replace(/\b\w/g, c => c.toUpperCase());
};

module.exports = {
    getAbility,
    getPokemon,
    fetch,
    capitalize,
    getFormattedBackendUrl
}