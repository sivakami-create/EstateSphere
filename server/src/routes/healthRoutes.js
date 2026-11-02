import { Router } from "express";

const router = Router();

router.get("/", (_request, response) => {
  response.json({ status: "ok", service: "EstateSphere API" });
});

export default router;
