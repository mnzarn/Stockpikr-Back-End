// Configure Auth Validation

export class Middleware {
  validateAuth(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect("/StockPikr_Frontend/#/signin");
    }
  }
}
