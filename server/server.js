import makeApp from "./app.js";

const NYATS_SERVER_PORT = process.env.NYATS_SERVER_PORT || "9614";

try {
	const app = await makeApp();
	app.listen(NYATS_SERVER_PORT, () => {
		console.log(`nyats server listening on http://localhost:${NYATS_SERVER_PORT}`);
	});
} catch (err) {
	console.error("Error starting server:", err);
}
