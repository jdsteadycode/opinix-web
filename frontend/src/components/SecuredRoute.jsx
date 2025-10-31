// grab module(s)
import { Navigate } from "react-router-dom";

// () -> SecuredRoute Component handle all authenticated-authorized Pages
function SecuredRoute({ pages, roleRequired = null }) {

    // check log**
    // console.log(pages);

    // grab the token from storage
    let token = localStorage.getItem("token");
    let role = localStorage.getItem("role");

    // when no `token` i.e., non-legit user then, redirect -> `/login`
    if(!token) return <Navigate to="/login" />;

    // authenticated, but not authorized for this route
    if (roleRequired && role !== roleRequired)  return <Navigate to="/" />;
    
    // otherwise, its an normal user..
    return pages;
} 

// expose to project
export { SecuredRoute };