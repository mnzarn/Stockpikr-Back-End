// Configure Auth Validation

export class Middleware {
  validateAuth(req, res, next) {
    if (req.isAuthenticated()) {
      console.log("The user is authenticated for this action!");
      next();
    } else {
      console.log("The user is not authenticated for this action!");
      res.redirect("http://localhost:3000/signin");
    }
  }
}
