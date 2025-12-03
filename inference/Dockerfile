# Stage 1: Build - Use the PyTorch-specific, pre-configured Triton image
# This ensures we have the correct PyTorch backend and a compatible server binary.
FROM nvcr.io/nvidia/tritonserver:25.11-pyt-python-py3 AS build

# Install PyTorch (The PyTorch-specific image likely already has it, 
# but this ensures the required Python packages are available system-wide 
# for copying in the next stage). We use the CPU index to ensure CPU wheels if possible.
# Note: The PyTorch backend is already installed in this image.
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Define standard Triton paths
ENV TRITON_SERVER_PATH=/opt/tritonserver

# ---

# # Stage 2: Runtime - Create the final, smaller runtime image
# FROM ubuntu:22.04 AS runtime

# # Define standard paths and variables
# ENV TRITON_SERVER_PATH=/opt/tritonserver \
#     # The default PyTorch path in Triton images is often a custom path
#     PYTHON_LIBS_SOURCE=/usr/local/lib/python3.10/dist-packages \
#     PYTHON_LIBS_DEST=/usr/local/lib/python3/dist-packages 

# # Install minimal OS dependencies, including Python and a library path utility
# RUN apt-get update && \
#     DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
#     python3 python3-pip curl ca-certificates libgomp1 && \
#     rm -rf /var/lib/apt/lists/*

# # Create the Triton server directory structure
# RUN mkdir -p ${TRITON_SERVER_PATH}/bin && \
#     mkdir -p ${TRITON_SERVER_PATH}/backends/pytorch

# # 1. Copy the core Triton server binary (now guaranteed to be PyTorch-compatible)
# COPY --from=build ${TRITON_SERVER_PATH}/bin/tritonserver ${TRITON_SERVER_PATH}/bin/
# # 2. Copy the required PyTorch backend library
# COPY --from=build ${TRITON_SERVER_PATH}/backends/pytorch/libtriton_pytorch.so ${TRITON_SERVER_PATH}/backends/pytorch/

# # 3. Copy ALL Python packages (PyTorch, Triton Python client, etc.)
# # We are assuming the Python path from the error is correct for the destination.
# # We are still guessing the source path. We will use the common default.
# COPY --from=build ${PYTHON_LIBS_SOURCE}/ ${PYTHON_LIBS_DEST}/

# # 4. Copy the necessary CUDA/NVIDIA shared libraries (This solves the libcudart error)
# # Note: We must locate and copy the specific shared objects needed by the server binary.
# # The pytorch tag still links to CUDA for accelerated math operations, even if we run on CPU.
# # We will copy the entire /usr/local/cuda/lib64/ folder to be safe.
# COPY --from=build /usr/local/cuda/lib64/ /usr/local/cuda/lib64/

# # Set the library path so the OS can find libcudart.so.12 and other required libs
# ENV LD_LIBRARY_PATH=/usr/local/cuda/lib64/:$LD_LIBRARY_PATH

# # Set the entrypoint to run the Triton server
WORKDIR /
ENTRYPOINT ["/opt/tritonserver/bin/tritonserver"]
CMD ["--model-repository=/models"]