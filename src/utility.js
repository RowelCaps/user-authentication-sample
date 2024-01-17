
export async function isAuthenticated(){

    try{
        const res = await fetch('https://user-authentication-sample.glitch.me/verify-authentication', {
            method:"get",
            credentials: 'include',
            headers: {'content-type': 'application/json'}
        });

        const data = await res.json();

        console.log(data.message);
        return data.success;
    } catch(err){

        console.log(err);
        return false;
    }

}