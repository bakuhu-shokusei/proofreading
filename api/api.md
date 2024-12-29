## getAll

request:

-   book (query)
-   type (query) = getAll

e.g. `book=test&type=getAll`

response:

```json
[
    { "page": 1, "content": "111" },
    { "page": 2, "content": "222" }
]
```

## getByPage

request:

-   book (query)
-   type (query) = getByPage
-   page (query)

e.g. `book=test&type=getByPage&page=1`

response:

```json
{ "page": 1, "content": "111" }
```

## updateAll

request:

-   book (query)
-   type (query) = updateAll

e.g. `type=updateAll&book=Sheet1`

response:

```json
[
    { "page": 1, "content": "111" },
    { "page": 2, "content": "222" }
]
```

## updateByPage

request:

-   book (query)
-   type (query) = updateByPage

e.g. `type=updateAll&book=Sheet1`

request:

```json
{ "page": 1, "content": "111" }
```
