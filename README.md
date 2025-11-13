### DEPLOYMENT TARGET
    Google Cloud Run Functions (node24 - latest LTS version)

# Starter Project Guide: Cloud Functions with esbuild

This document explains the architecture and workflow of this project, which is designed as a clean and efficient *starter kit* for developing *serverless functions* (e.g., Google Cloud Functions) using TypeScript and `esbuild`.

The goal is to provide an organized foundation, a fast build process, and an efficient development workflow for your new projects.

## 1. Philosophy & Core Concepts

- **One Repository, Many Functions (Optional)**: Although this is a starter project, its structure supports developing multiple functions within a single repository if needed in the future. This simplifies dependency management and code sharing.
- **Isolation at Deployment**: Each function is built and deployed separately. Every function has its own `dist` folder containing everything it needs, including a dynamically generated and optimized `package.json`.
- **Shared Code**: Code used by more than one function (such as utilities or core services) can be placed in the `src/shared` directory.
- **Fast Builds with `esbuild`**: We use `esbuild` to bundle TypeScript code into JavaScript. `esbuild` is chosen for its exceptional speed compared to the traditional TypeScript compiler (`tsc`).
- **Separate Type Definitions (`.d.ts`)**: The process of generating type definition files (`.d.ts`) is separated from the bundling process. This allows `esbuild` to focus on bundling speed, while `tsc` handles accurate type generation.

## 2. Directory Structure

The project structure is designed to be intuitive and scalable.

```plaintext
.
├── dist/                   # Build output directory (auto-generated)
│   └── example/            # Build output for the 'example' function
│       ├── index.js        # Bundled function code
│       ├── index.js.map    # Source map for debugging
│       ├── package.json    # Deployment-specific package.json
│       └── ...             # .d.ts files for type definitions
│
├── node_modules/           # Project dependencies
├── src/                    # Main source code directory
│   ├── example/            # Source code for the 'example' function
│   │   └── index.ts        # Entry point for the 'example' function
│   └── shared/             # Reusable code across all functions
│       └── utils/          # Utility functions (e.g., helpers)
│           └── greeting.ts # Example utility
│
├── scripts/                # Directory for build and utility scripts
│   ├── esbuild.config.js   # (1) Configuration for bundling code with esbuild
│   ├── esbuild.copy-files.js # (2) Script for copying deployment files (package.json, .env)
│   └── esbuild.dts.js      # (3) Script for generating type definition files (.d.ts)
├── package.json            # Dependencies and scripts for the development environment
└── tsconfig.json           # Main TypeScript configuration
```

## 3. Build Process Flow

The build process is orchestrated through scripts in `package.json` and consists of three main steps executed sequentially for each function. Let's take `build:example` as an example:

**Command:** `pnpm run build:example`

This will execute: `node scripts/esbuild.config.js example && node scripts/esbuild.copy-files.js example && pnpm run dts:example`

### Step 1: Bundling Code with `esbuild.config.js`

- **What happens?**: `esbuild` takes `src/example/index.ts` as its entry point.
- **Process**: It reads the file, follows all `import` statements (including from `src/shared`), and bundles them into a single JavaScript file: `dist/example/index.js`.
- **Optimizations**:
    - **Tree-shaking**: Unused code from `shared` or other dependencies is discarded.
    - **Path Alias**: Converts aliases like `~shared/utils/greeting` into correct relative paths within the bundle.
    - **Externals**: Heavy dependencies like `@google-cloud/*` are not included in the bundle. They will be installed in the cloud environment upon deployment.
- **Output**: `dist/example/index.js` and `dist/example/index.js.map`.

### Step 2: Copying Deployment Files with `esbuild.copy-files.js`

- **What happens?**: This script prepares the `dist/example` folder to be ready for deployment.
- **Process**:
    1.  Reads the main `package.json`.
    2.  Extracts `name` (with an `-example` suffix), `version`, `engines`, and `dependencies`.
    3.  Writes this new JSON object to `dist/example/package.json`.
    4.  Copies other necessary runtime configuration files, such as `.env.prod` (renamed to `.env`) and `.gcloudignore` (if present).
- **Output**: The `dist/example` folder now contains an optimized `package.json`, `.env`, etc.

### Step 3: Generating Type Definitions with `esbuild.dts.js`

- **What happens?**: `esbuild` does not generate `.d.ts` files. We delegate this task back to the TypeScript compiler (`tsc`).
- **Process**:
    1.  This script dynamically creates a temporary configuration file, `tsconfig.example.temp.json`.
    2.  This temporary file tells `tsc` to only process the `src/example` and `src/shared` folders.
    3.  `tsc` is run with the `emitDeclarationOnly: true` option, so it only generates `.d.ts` files inside `dist/example` according to the original folder structure.
    4.  The `tsconfig.example.temp.json` file is deleted upon completion.
- **Output**: A folder structure of `*.d.ts` files inside `dist/example` that mirrors the structure of `src/example` and `src/shared`.

## 4. How to Adapt for a New Project

To create a new function in this project:

1.  **Create Function Directory**: Create a new directory in `src/` for your function, e.g., `src/my-new-function/`.
2.  **Create Entry Point**: Inside the new function directory, create an `index.ts` file as the main entry point for your function (e.g., `src/my-new-function/index.ts`).
3.  **Update `package.json`**:
    *   Add `dts:my-new-function` and `build:my-new-function` scripts in the `scripts` section of `package.json`.
    ```json
    "scripts": {
      "dts:example": "node scripts/esbuild.dts.js example",
      "build:example": "node scripts/esbuild.config.js example && node scripts/esbuild.copy-files.js example && pnpm run dts:example",
      "dts:my-new-function": "node scripts/esbuild.dts.js my-new-function",
      "build:my-new-function": "node scripts/esbuild.config.js my-new-function && node scripts/esbuild.copy-files.js my-new-function && pnpm run dts:my-new-function"
    }
    ```
4.  **Update `scripts/esbuild.config.js`**: Add an `if` block for your new function's build target.
    ```javascript
    // scripts/esbuild.config.js
    // ... (existing code) ...

    if (buildTarget === 'my-new-function' || buildTarget === 'all') {
      await buildFunction('src/my-new-function/index.ts', 'dist/my-new-function');
    }

    console.log('✨ Build complete!');
    })()
    ```
5.  **Run the Build**: You can now build your new function with `pnpm run build:my-new-function`.

By following these steps, you can quickly set up and develop new functions in your project.
