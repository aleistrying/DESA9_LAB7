const utils = require("./utils");
(async () => {
    const pokemonName = "Pikachu"

    //get the pokemon basic information
    // El nombre del pokemon
    // El id del pokedex
    // La altura y el peso
    // Las habilidades
    // Y, la cadena de evolución.
    try {

        const { id, name, weight,
            height, sprites, abilities,
            evolutionChain } = await utils.getPokemon({ nameOrId: pokemonName.toLowerCase() });

        console.log({
            id,
            name: utils.capitalize(name),
            weight,
            height,
            // sprites,
            abilities: abilities.map((abilityObject) => {
                return { name: utils.capitalize(abilityObject.ability.name), isHidden: abilityObject.is_hidden }
            }),
            evolutionChain: evolutionChain.map((pokemon) => {
                return { name: utils.capitalize(pokemon.name), isBaby: pokemon.isBaby ? "is baby 👶" : "not 👶" }
            })
        })

    } catch (e) {
        console.log(e)
    }
})()
