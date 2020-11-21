# @bluebird/react-rest-store

> Apollo inspired library to connect redux, local-storage, and rest domains seamlessly.

[![NPM](https://img.shields.io/npm/v/@bluebird/react-rest-store.svg)](https://www.npmjs.com/package/@bluebird/react-rest-store) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## What is this?

It is a library to attempt to make life easier by reducing boilerplate introduced with Redux + API connections.

### Features
* Tracking Rest executions (does not execute same command twice).
* Exclusive use of hooks for clean code.
* Persisting data in a redux store.
* Persisting data over refreshes (localstorage).
* Has intervals.
* Has manually fetching.
* Exposes native libraries.

## Install

```bash
npm install --save @bluebird/react-rest-store
```

## Simplest Usage

Example [here](https://bluebirddev.github.io/rrs/)

```tsx
import React from 'react';

import {createRrs } from '@bluebird/react-rest-store';

const { Provider, domain } = createRrs({
  domain: {
    baseURL: 'https://jsonplaceholder.typicode.com',
  },
});

const Todos = () => {
  const { data: todos, loading } = domain.useGet('/todos');

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Completed</th>
        </tr>
      </thead>
      <tbody>
        {todos.map((todo: any) => (
          <tr key={todo.id}>
            <td>{todo.title}</td>
            <td>{todo.completed && 'X'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const App = () => (
  <Provider>
    <Todos />
  </Provider>
);

export default App;
```

## License

MIT © [vssrcj](https://github.com/vssrcj)
