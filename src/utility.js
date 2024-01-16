
export async function isAuthenticated(){

    try{
        const res = await fetch('http://localhost:3000/verify-authentication', {
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