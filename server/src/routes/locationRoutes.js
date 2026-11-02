import { Router } from "express";
import { indiaLocations } from "../data/indiaLocations.js";

const router = Router();

router.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    data: indiaLocations,
    coverage: {
      statesAndUnionTerritories: indiaLocations.length,
      localityNote: "Locality options are curated examples for selected cities and are not exhaustive.",
    },
  });
});

export default router;
