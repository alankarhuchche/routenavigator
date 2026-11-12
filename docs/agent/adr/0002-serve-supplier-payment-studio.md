# Serve Route Navigator Studio from the Cloud Run container

The supplier payment case was reviewed and tested as a self-contained browser simulation. The GitHub container build needs its source to serve the same walkthrough on Cloud Run.

Both Dockerfiles build `studio/` and copy its assets into the Quarkus static resource directory. The original `frontend/` app remains available for local work with the Quarkus APIs. The supplier case uses deterministic browser fixtures and stores its decision ledger in the browser. The Quarkus API routes and runtime configuration keep their existing contracts.

The public repository contains the studio source and bundled assets. The private Sites manifest and deployment URL belong to the separate Sites workspace.
