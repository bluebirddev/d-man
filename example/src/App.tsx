import React from 'react';

import { createDMan } from 'd-man';

const { Provider, domain, useLocal } = createDMan({
  domain: {
    baseURL: 'https://jsonplaceholder.typicode.com',
  },
});

function useCounter() {
  return useLocal('counter', 0);
}

function useDummyPost() {
  return domain.usePost('/dummy', { fake: 10000, multiple: true });
}

const Todos = () => {
  const { data: todos, loading, execute: refreshTodos } = domain.useGet('/todos');
  const { data: counter, dispatch } = useCounter();
  const dummyPost = useDummyPost();

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      Local counter: {counter}
      <button type="button" style={{ marginLeft: 10 }} onClick={() => dispatch(counter + 1)}>+1</button>
      <hr />
      <button type="button" onClick={() => dummyPost.execute()}>Execute dummy post</button>
      <button type="button" onClick={() => refreshTodos()}>Refresh data</button>
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
    </div>
  );
};

const App = () => (
  <Provider>
    <Todos />
  </Provider>
);

export default App;