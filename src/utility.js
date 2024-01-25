
export async function isAuthenticated(){

    try{
        const res = await fetch(`${import.meta.env.VITE_REACT_API_SERVER_URL}/verify-authentication`, {
            method:'GET',
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