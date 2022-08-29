var express = require("express")
var router = express.Router()
//middleware
const AuthMiddleware = require("./Middleware/auth")
//internal routes
const UserController = require("./Controllers/UserController")
const TransferController = require("./Controllers/TransferController")
const SubdivideController = require("./Controllers/SubdivideController")

//blockchain routes
const WitnessController = require("./Controllers/WitnessController")
const PeerController = require("./Controllers/PeerController")
const OwnerController = require("./Controllers/OwnerController")
const TitleController = require("./Controllers/TitleController")
const ConfirmationController = require("./Controllers/ConfirmationController")
const SearchController = require("./Controllers/SearchController")



//user routes
router.post("/api/v1/user/signup", UserController.signup)
router.post("/api/v1/user/login", UserController.login)
router.post("/api/v1/user/submitKey", AuthMiddleware, UserController.submitKey)
router.post("/api/v1/user/searchKeyRef", AuthMiddleware, UserController.searchKeyRef)
router.post("/api/v1/user/getDetails", AuthMiddleware, UserController.getDetails)

//witness routes
router.post("/api/v1/witness/add", WitnessController.add)
//owner routes
router.post("/api/v1/owner/add", OwnerController.add)
router.post("/api/v1/owner/addMigrate", OwnerController.addMigrate)
router.post("/api/v1/owner/changeKey", OwnerController.changeKey)
router.post("/api/v1/owner/changeWitness", OwnerController.changeWitness)
//peer routes
router.post("/api/v1/peer/add", PeerController.add)
//searhc routes
router.post("/api/v1/search/getResult", SearchController.getResult)

//title routes
router.post("/api/v1/title/add", TitleController.add)
router.post("/api/v1/title/subdivide", TitleController.subdivide)
router.post("/api/v1/title/search", AuthMiddleware, TitleController.search)
router.post("/api/v1/title/searchResults", AuthMiddleware, TitleController.searchResults)

//transfer routes
router.post("/api/v1/transfer/transferResults", AuthMiddleware, TransferController.transferResults)
router.post("/api/v1/transfer/getTransfer", AuthMiddleware, TransferController.getTransfer)
router.post("/api/v1/transfer/userTransfer", AuthMiddleware, TransferController.userTransfer)
router.post("/api/v1/transfer/boardApproval", AuthMiddleware, TransferController.boardApproval)
router.post("/api/v1/transfer/registrarApproval", AuthMiddleware, TransferController.registrarApproval)

//subdivide routes
router.post("/api/v1/subdivide/subdivideResults", AuthMiddleware, SubdivideController.subdivideResults)
router.post("/api/v1/subdivide/getSubdivision", AuthMiddleware, SubdivideController.getSubdivision)
router.post("/api/v1/subdivide/submitPlan", AuthMiddleware, SubdivideController.submitPlan)
router.post("/api/v1/subdivide/boardApproval", AuthMiddleware, SubdivideController.boardApproval)
router.post("/api/v1/subdivide/registrarApproval", AuthMiddleware, SubdivideController.registrarApproval)
//block
router.post("/api/v1/block/getConfirmedStatus", ConfirmationController.getStatus)

module.exports = router
