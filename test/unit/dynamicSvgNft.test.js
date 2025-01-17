// We are going to skimp a bit on these tests...

const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const fs = require("fs")

if (!developmentChains.includes(network.name)) {
    describe.skip
} else {
    describe("Dynamic SVG NFT Unit Tests", function () {
        let dynamicSvgNft, deployer, baseURL, lowSVG, highSVG, priceFeed, tokenCounter

        beforeEach(async () => {
            accounts = await ethers.getSigners()
            deployer = accounts[0]
            await deployments.fixture(["mocks", "dynamicsvg"])
            dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
            baseURL = "data:image/svg+xml;base64,"
            lowSVG = fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf8" })
            highSVG = fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf8" })
            priceFeed = await ethers.getContract("MockV3Aggregator")
        })

        describe("constructor", () => {
            it("set tokenCounter to 0", async function () {
                tokenCounter = await dynamicSvgNft.getTokenCounter()
                assert.equal(tokenCounter, "0")
            })
            it("set lowImageURI", async function () {
                assert.equal(
                    baseURL + Buffer.from(lowSVG).toString("base64"),
                    await dynamicSvgNft.getLowSVG()
                )
            })
            it("set highImageURI", async function () {
                assert.equal(
                    baseURL + Buffer.from(highSVG).toString("base64"),
                    await dynamicSvgNft.getHighSVG()
                )
            })
            it("Set priceFeed", async function () {
                assert.equal(priceFeed.address, await dynamicSvgNft.getPriceFeed())
            })
        })
        describe("mintNft", () => {
            it("emit event CreatedNFT whit tokenId=tokenCounter and highValue for args", async () => {
                const highValue = ethers.utils.parseEther("1")
                tokenCounter = await dynamicSvgNft.getTokenCounter()
                await expect(dynamicSvgNft.mintNft(highValue))
                    .to.emit(dynamicSvgNft, "CreatedNFT")
                    .withArgs(tokenCounter.toString(), highValue)
            })

            const highValue = ethers.utils.parseEther("1")

            it("token counter increased by 1", async function () {
                const oldTokenCounter = Number(await dynamicSvgNft.getTokenCounter())
                await dynamicSvgNft.mintNft("1")
                assert.equal(oldTokenCounter + 1, Number(await dynamicSvgNft.getTokenCounter()))
            })
        })
    })
}
