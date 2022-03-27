/*
EVERYTHING DB RELATED
*/
const { createClient } = require("@supabase/supabase-js");
const functions = require('./functions.js')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
async function signedUp(id) { //checks if user is signed up
    const { data } = await supabase
        .from('balance')
        .select('discordid')
        .eq('discordid', id)
    return typeof data[0] !== "undefined"
}
async function getBalance(id){ //returns balance
    const { data } = await supabase
                    .from('balance')
                    .select('value')
                    .eq('discordid', id)
    return data[0].value
}
async function deleteUser(id){ //deletes user
await supabase
                        .from('balance')
                        .delete()
                        .eq('discordid', id)
}
async function setBalance(id,value){//sets user balance
    value = functions.roundCents(value);
    await supabase
                .from('balance')
                .update({ value: value })
                .eq('discordid', id)
}
async function signUp(id,username){ //signs user up
    await supabase
                .from('balance')
                .insert([
                    { discordid: id, username: username },
                ])
}
async function getAll(){ //gets all users
    await supabase
    const {data} = await supabase
    .from('balance')
    .select('*')
    return data
}

module.exports = {signedUp, deleteUser, getBalance, setBalance, signUp, getAll}