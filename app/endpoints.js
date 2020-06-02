function getEndpoint(analysisId) {
    var endpoint;
    if (analysisId === 1) {
        endpoint = "https://u73oq6vts0.execute-api.us-east-1.amazonaws.com/prod";
    }
    else if (analysisId === 2) {
        endpoint = "https://7te4r3q8lj.execute-api.us-east-1.amazonaws.com/prod";
    }

    return endpoint;
}
