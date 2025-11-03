- [attention head](#attention-head)
- [attention mechanism](#attention-mechanism)
- [BERT (Bidirectional Encoder Representations from Transformers)](#bert-bidirectional-encoder-representations-from-transformers)
- [BPE (byte pair encoding)](#bpe-byte-pair-encoding)
- [chunking](#chunking)
- [cosine distance](#cosine-distance)
- [cosine similarity](#cosine-similarity)
- [embedding](#embedding)
- [Euclidean distance](#euclidean-distance)
- [function calling](#function-calling)
- [GAN (generative adversarial network)](#gan-generative-adversarial-network)
- [GPT (Generative Pre-Trained Transformer)](#gpt-generative-pre-trained-transformer)
- [grammar (in the context of NLP)](#grammar-in-the-context-of-nlp)
- [hidden Markov model (in the context of NLP)](#hidden-markov-model-in-the-context-of-nlp)
- [lemmatization](#lemmatization)
- [LLM (large language model)](#llm-large-language-model)
- [Minkowski distance](#minkowski-distance)
- [MoE (Mixture of Experts)](#moe-mixture-of-experts)
- [named-entity recognition](#named-entity-recognition)
- [n-grams](#n-grams)
- [part of speech tagging](#part-of-speech-tagging)
- [RAG (retrieval augmented generation)](#rag-retrieval-augmented-generation)
- [re-ranker](#re-ranker)
- [RLHF (reinforcement learning from human feedback)](#rlhf-reinforcement-learning-from-human-feedback)
- [stemming](#stemming)
- [stop words](#stop-words)
- [tf-idf](#tf-idf)
- [tokenizing](#tokenizing)
- [transformer](#transformer)

## attention head
A component of a [transformer](#transformer) model that computes attention scores for a subset of the input tokens. Each attention head learns to focus on different aspects of the input data, and the outputs of multiple attention heads are combined to produce the final output of the transformer layer.
See also:
- [[@Vaswani_2023]] "Attention is All You Need" (2023 revision from ArXiv)
## attention mechanism
A neural network component that allows a model to selectively focus on certain parts of an input sequence when generating an output. Attention mechanisms are commonly used in [transformer](#transformer) models to weight the importance of different input tokens when generating an output sequence.
See also:
- [[@Vaswani_2023]] "Attention is All You Need" (2023 revision from ArXiv)
## BERT (Bidirectional Encoder Representations from Transformers)
Pretrained embedding model for transforming text documents into an embedded space. Used extensively in RAG applications as a reproducible way of producing vector embeddings representing text content. More recent implementations from Nomic AI extend the capabilities to longer context lengths and use various training techniques to improve the output. Closed-source competitors include OpenAI's `text-embedding-ada-002` and `text-embedding-3`
See also:
- [[@Devlin_2019]] BERT Paper
- [[@Nussbaum_nd]] Nomic Embedding (improved version of BERT)
## BPE (byte pair encoding)
Technique that generates a finite, spanning set of [tokens](#tokenizing) (a "vocabulary") by starting with all possible characters (byte pairs) and then repeatedly adding the most frequent combinations of two or more characters until a desired size is reached. Because any string can be broken down into at most the set of unique characters, this ensures a finite-length encoding of any string.
See also:
- https://github.com/openai/tiktoken OpenAI's tokenization model (~100k tokens)
- https://huggingface.co/docs/transformers/en/tokenizer_summary Detailed overview of tokenizers, most of which are available in the `transformers` library
## chunking
In [RAG](#RAG (retrieval augmented generation)) applications, the process of breaking down an input document or data source into subsections to be classified/projected into the vector store. If dealing with text documents, this determination is often a certain number of characters and is probably domain specific. RAG applications typically struggle if asked to retrieve information that requires the "context" of multiple chunks - however, there are various ways of working around this by using clever retrieval methods, graph relationships between chunks, etc.
## cosine distance
Commonly defined as 1 minus the [[#cosine similarity]]
## cosine similarity
Way of measuring the similarity of two vectors by calculating the cosine of the angle between them in arbitrary dimensions. Using cosine of the angle ensures that the value ranges from 1 to -1. Actual calculation is:
$$
\text{cosine similarity}=\frac{\vec A \cdot \vec B}{\|A\|\|B\|}
$$
This reduces to the cosine of the angle between the two vectors in two dimensions. An implementation of this similarity could look like:
```python
import numpy as np

def cos_similarity(a, b):
	"""Cosine similarity where a and b are (n,) vectors"""
	return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def cos_similarity_nd(A, b):
	"""Cosine similarity where A is an (m, n) matrix and b is a (n,) vector"""
	return np.matmul(A, b.reshape(-1,1)) / (np.linalg.norm(A, axis=1) * np.linalg.norm(b))
```
## embedding
Generally, a lower-dimensional representation of a higher dimensional data source that maintains some of the relationships that exist in higher dimensions. In the context of NLP, this typically refers to numerical representations of textual data, and usually involves some combination of feature preparation (tokenization, stemming, lemmatization, etc.) followed by an encoding, often with a transformer model
## Euclidean distance
Way of measuring the distance between two vectors by taking the magnitude of their difference, i.e.,
$$
\text{Euclidean distance}(\vec a, \vec b) =\|\vec a - \vec b\| 
$$
## function calling
Specific task for large language models involving producing the function call, or a structured text such as JSON specifying such a call, based on the prompt
## GAN (generative adversarial network)
A type of neural network architecture that consists of two models: a generator and a discriminator. The generator creates new data instances, while the discriminator evaluates the quality of the generated data. The two models are trained together in an adversarial process until the generator produces data that is indistinguishable from real data.
![[Pasted image 20240326155700.png]] 
Source: https://developers.google.com/machine-learning/gan/gan_structure
## GPT (generative pre-trained transformer)
A subclass of LLMs specifically referring to large [transformer](#transformer) models with [attention mechanisms](#attention-mechanism). A better way to refer to this class of models than simply calling them "LLMs" which encompasses a much wider range of models and applications.
See also:
- [[@Radford_nd]] GPT-2 Paper
- [[@GoogleCloudTech_2021]] Video explaining transformers including GPT, BERT, and T5
## grammar (in the context of NLP)
A specification for the expected output of a model. Useful in particular for models that are asked to generate function calls. Usually written in TypeScript or some other typed-JavaScript derivative, then compiled to a regex that can be matched against the model output.
See also:
- https://grammar.intrinsiclabs.ai/ Tool for generating grammars from TypeScript interfaces
## hidden Markov model (in the context of NLP)
A statistical model used to represent the probability distribution over a sequence of observations. In NLP, hidden Markov models are often used for tasks such as part-of-speech tagging and named entity recognition, where the goal is to infer the underlying sequence of states (e.g., parts of speech) given the observed sequence of words.
## lemmatization
Broader term encompassing stemming and other techniques that reduce a word to a single "dictionary" form. This can include stemming and other techniques, like conjugation.
TODO: Add NLTK demo
## LLM (large language model)
Machine learning model, usually based on a deep neural network and particularly a deep network involving transformers with attention mechanisms, that has been trained on a large number of text documents. The term usually refers to models with a generative, textual interface.
## Minkowski distance
Generalized metric encompassing Manhattan distance (order 1) and [[#Euclidean distance]] (order 2) as well as higher dimensions. For an order $p$, the Minkowski distance is defined as:
$$
D_p(\vec a, \vec b)= \left(\sum_{i=1}^{n}|a_i-b_i|^p \right)^{\frac{1}{p}}
$$

## MoE (Mixture of Experts)
See also:
- [[@Jiang_2024]] Mistral 8x7B model paper
## named-entity recognition
Process of identifying tokens that refer to specific people, places, or other "named entities" that can be enhanced with generally-available knowledge. For instance, "George Washington" means something different than just a 2-gram of "George" and "Washington", so it might benefit a model to treat this differently.
## n-grams
Groups of $n$ tokens. If a text contains $N$ tokens, it contains $N-n+1$ $n$-grams. The total number of n-grams of lengths up to n is given by:
$$
\sum_{i=1}^{N-1}N-n+1=O(N^2)
$$
For this reason, it is rarely practical to compute $n$-grams longer than ~4 words; the exception could be a specific domain where tokens often come in longer sequences - for instance, if processing molecule names that have been split into longer sequences of stems.
See also:
- https://www.nltk.org/api/nltk.lm.html
## part of speech tagging
Process of engineering additional features that identify the part of speech of a given token
See also:
- https://www.nltk.org/api/nltk.tag.html
## RAG (retrieval augmented generation)
A class of NLP applications involving a generative model that utilizes information retrieved from a reference. The reference is often a collection of documents or structured data, but could also be API calls or other abstracted information. The system usually involves two model calls - one to generate a "query" for the reference materials, and one to generate a result based on the retrieved context and initial prompt.
## re-ranker
Technique for improving RAG applications. This is usually a purpose-built or tuned model that evaluates the retrieved references and ranks them before passing them to the generative model. This works because it separates the task of evaluating the quality of the results (which is relatively easy to train on a smaller, perhaps domain/architecture-specific model) from synthesizing a response.
## RLHF (reinforcement learning from human feedback)
A technique for training machine learning models using human feedback as a reward signal. The model is trained to optimize for a specific objective based on the feedback provided by human evaluators. This approach is commonly used in NLP applications such as language generation and dialogue systems.
## stemming
Removing affixes (prefixes and suffixes) to obtain just the core part of the word (the stem). The most well-known method is called the Porter stemmer with the Snowball stemmer being a more recent upgraded method.
```python
from nltk.stem.porter import PorterStemmer
from nltk.stem.snowball import SnowballStemmer

plurals = ['caresses', 'flies', 'dies', 'mules', 'denied', 'died', 'agreed', 'owned', 'humbled', 'sized', 'meeting', 'stating', 'siezing', 'itemization', 'sensational', 'traditional', 'reference', 'colonizer', 'plotted']

porter = PorterStemmer()
snowball = SnowballStemmer() # Can also set ignore_stopwards=True

singles_porter = [porter.stem(p) for p in plurals]
singles_snowball = [snowball.stem(p) for p in plurals]
```
## stop words
Words such as prepositions, pronouns, and articles which do not hold information about the subject or sentiment of the text (at least without the context of other words). Frequently used in simple NLP applications such as bag-of-words or TF-IDF to remove obfuscating content before computing n-grams. Stop words are inherently domain-specific, so use caution when applying generic lists of stopwords.
```python
import nltk  
nltk.download('stopwords') # if not already downloaded
from nltk.corpus import stopwords
```
## tf-idf
A class of weights used to assess the "importance" of a word by comparing its frequency in a given document to its frequency in the general corpus. Typically calculated as the product of the "term frequency" with "inverse document frequency". Though both of these terms can have different definitions that scale and normalize, the most common definition is:
$$
\text{tf}(t,d)=\frac{f_t}{N_d}
$$
where $f_t$ is the number of times the term $t$ occurs in a document $d$ of length $N_d$.
$$
\text{idf}(t, D)=\log\left(\frac{N}{n_t}\right)
$$
Where N is the total number of documents in the set $D$ and $n_t$ is the number of documents containing at least one occurrence of the term $t$
## tokenizing
Turning a string of text into a list of tokens, often words
```python
input_text = "This is a string of input text that we want to tokenize."
tokens = input_text.split()
tokens
```
More recent models use much more advanced techniques.
See also:
- [[#BPE (byte pair encoding)]]
## transformer
A deep learning architecture that uses attention mechanisms to process input sequences of arbitrary length. The transformer model was introduced in the paper "Attention is All You Need" and has since become a popular choice for NLP tasks such as language translation and text classification.
See also:
- [[@Vaswani_2023]] "Attention is All You Need" (2023 revision from ArXiv)