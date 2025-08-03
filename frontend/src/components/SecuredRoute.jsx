// grab module(s)
import { Navigate } from "react-router-dom";

// () -> SecuredRoute Component handle all authenticated-authorized Pages
function SecuredRoute({ pages }) {

    // check log**
    console.log(pages);

    // grab the token from storage
    let token = localStorage.getItem("token");

    // when no `token` i.e., non-legit user then, redirect -> `/login`
    // otherwise allow authenticated user!
    return !token ? <Navigate to="/login" /> : pages;
} 

// expose to project
export { SecuredRoute };