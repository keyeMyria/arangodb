////////////////////////////////////////////////////////////////////////////////
/// @brief variant class for booleans
///
/// @file
///
/// DISCLAIMER
///
/// Copyright 2010-2011 triagens GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is triAGENS GmbH, Cologne, Germany
///
/// @author Dr. Frank Celler
/// @author Achim Brandt
/// @author Copyright 2008-2011, triAGENS GmbH, Cologne, Germany
////////////////////////////////////////////////////////////////////////////////

#ifndef TRIAGENS_JUTLAND_BASICS_VARIANT_BOOLEAN_H
#define TRIAGENS_JUTLAND_BASICS_VARIANT_BOOLEAN_H 1

#include <Variant/VariantObject.h>

namespace triagens {
  namespace basics {

    ////////////////////////////////////////////////////////////////////////////////
    /// @ingroup Variants
    /// @brief variant class for booleans
    ////////////////////////////////////////////////////////////////////////////////

    class VariantBoolean : public VariantObjectTemplate<bool, VariantObject::VARIANT_BOOLEAN, VariantBoolean> {
      public:

        ////////////////////////////////////////////////////////////////////////////////
        /// @brief constructs a new boolean
        ////////////////////////////////////////////////////////////////////////////////

        explicit
        VariantBoolean (bool value);

      public:

        ////////////////////////////////////////////////////////////////////////////////
        /// {@inheritDoc}
        ////////////////////////////////////////////////////////////////////////////////

        void print (StringBuffer&, size_t indent) const;
    };
  }
}

#endif
