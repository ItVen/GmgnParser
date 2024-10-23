import axios from "axios";
//docker run -d --name flaresolverr -p 8191:8191 ghcr.io/flaresolverr/flaresolverr:latest
export async function fetchWithFlareSolverr(url: string) {
  try {
    const res = await axios.post("http://localhost:8191/v1", {
      cmd: "request.get",
      url: url,
    });
    const data = res.data.solution;
    const response = JSON.parse(
      `{${data.response.split(">{")[1].split("}</pre>")[0]}}`
    );
    return response;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
